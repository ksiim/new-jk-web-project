from fastapi import HTTPException

from src.app.db.models.poe import Poe
from src.app.db.models.route import (
    Pace,
    Route,
    RouteGeneratedPublic,
    RouteGenerateRequest,
    RouteGenerateResponse,
    RoutePoint,
    RoutePointPublic,
)
from src.app.db.schemas import DetailResponse
from src.app.repositories.poe import PoeRepository
from src.app.repositories.route import RouteRepository
from src.app.service.base import BaseService
from src.app.service.poe import distance_meters

PACE_WALKING_SPEED_METERS_PER_MINUTE = {
    Pace.SLOW: 55,
    Pace.MEDIUM: 75,
    Pace.FAST: 95,
}


class RouteService(BaseService[RouteRepository]):
    def __init__(self, repository: RouteRepository, poe_repository: PoeRepository) -> None:
        super().__init__(repository)
        self.poe_repository = poe_repository

    async def generate_route(self, request: RouteGenerateRequest) -> RouteGenerateResponse:
        candidates = await self.poe_repository.list_candidates(
            city_id=request.city_id,
            wheelchair_accessible=True if request.accessibility.wheelchair_required else None,
            avoid_stairs=request.accessibility.avoid_stairs,
        )
        selected = self._select_points(request, list(candidates))
        if not selected:
            raise HTTPException(status_code=404, detail="No POE candidates found for route")
        route_distance = self._route_distance(request, selected)
        accessibility_score = self._accessibility_score(selected)
        route = Route(
            title=self._build_title(request, selected),
            description=f"Маршрут на {request.duration_minutes // 60 or 1} ч. по городу",
            city_id=request.city_id,
            duration_minutes=request.duration_minutes,
            distance_meters=route_distance,
            pace=request.pace,
            start_lat=request.start_location.lat,
            start_lng=request.start_location.lng,
            start_address=request.start_location.address,
            accessibility_score=accessibility_score,
        )
        points = [
            RoutePoint(
                route_id=route.id,
                order=index,
                poe_id=poe.id,
                planned_stop_minutes=poe.duration_minutes,
            )
            for index, poe in enumerate(selected, start=1)
        ]
        route_public = RouteGeneratedPublic(
            id=route.id,
            title=route.title,
            description=route.description,
            city_id=route.city_id,
            status=route.status,
            source=route.source,
            duration_minutes=route.duration_minutes,
            distance_meters=route.distance_meters,
            pace=route.pace,
            points=[
                RoutePointPublic(
                    order=point.order,
                    poe_id=point.poe_id,
                    planned_stop_minutes=point.planned_stop_minutes,
                )
                for point in points
            ],
            accessibility_score=route.accessibility_score,
        )
        await self.repository.create_with_points(route, points)
        return DetailResponse(data=route_public)

    def _select_points(self, request: RouteGenerateRequest, candidates: list[Poe]) -> list[Poe]:
        interests = {interest.lower() for interest in request.interests}
        matching = [
            poe
            for poe in candidates
            if not interests
            or poe.category.lower() in interests
            or interests.intersection({tag.lower() for tag in poe.tags})
        ]
        pool = matching or candidates
        current_lat = request.start_location.lat
        current_lng = request.start_location.lng
        selected: list[Poe] = []
        spent_minutes = 0
        speed = PACE_WALKING_SPEED_METERS_PER_MINUTE[request.pace]

        while pool:
            next_poe = min(
                pool,
                key=lambda poe: distance_meters(current_lat, current_lng, poe.lat, poe.lng),
            )
            travel_minutes = distance_meters(
                current_lat,
                current_lng,
                next_poe.lat,
                next_poe.lng,
            ) / speed
            planned_minutes = round(travel_minutes + next_poe.duration_minutes)
            if selected and spent_minutes + planned_minutes > request.duration_minutes:
                break
            selected.append(next_poe)
            spent_minutes += min(planned_minutes, request.duration_minutes - spent_minutes)
            current_lat = next_poe.lat
            current_lng = next_poe.lng
            pool.remove(next_poe)
            if spent_minutes >= request.duration_minutes:
                break
        return selected

    def _route_distance(self, request: RouteGenerateRequest, points: list[Poe]) -> int:
        total = 0
        current_lat = request.start_location.lat
        current_lng = request.start_location.lng
        for point in points:
            total += distance_meters(current_lat, current_lng, point.lat, point.lng)
            current_lat = point.lat
            current_lng = point.lng
        return total

    def _accessibility_score(self, points: list[Poe]) -> int:
        if not points:
            return 0
        point_scores = [
            100 if poe.wheelchair_accessible and not poe.has_stairs else 70 if poe.has_ramp else 40
            for poe in points
        ]
        return round(sum(point_scores) / len(point_scores))

    def _build_title(self, request: RouteGenerateRequest, points: list[Poe]) -> str:
        if request.interests:
            return "Маршрут: " + " + ".join(request.interests[:2])
        if points:
            return f"Маршрут: {points[0].category}"
        return "Новый маршрут"
