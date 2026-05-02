from __future__ import annotations

import datetime
import uuid

import pytest
from fastapi import HTTPException

from src.app.db.models.route import (
    Pace,
    Route,
    RouteManualUpdate,
    RoutePoint,
    RouteProgressUpdate,
    RouteSource,
    RouteStatus,
)
from src.app.service.route import (
    PACE_WALKING_SPEED_METERS_PER_MINUTE,
    RouteService,
)


class FakeRouteRepository:
    def __init__(self):
        self.route = None
        self.points = None
        self.routes: list[Route] = []
        self.route_points: dict[str, list[RoutePoint]] = {}

    async def create_with_points(self, route, points):
        self.route = route
        self.points = points
        self.routes.append(route)
        self.route_points[route.id] = list(points)
        return route

    async def list_user_routes(
        self,
        user_id,
        skip,
        limit,
        status=None,
        source=None,
        date_from=None,
        date_to=None,
    ):
        items = [route for route in self.routes if route.user_id == user_id]
        if status is not None:
            items = [route for route in items if route.status == status]
        if source is not None:
            items = [route for route in items if route.source == source]
        if date_from is not None:
            items = [route for route in items if route.created_at >= date_from]
        if date_to is not None:
            items = [route for route in items if route.created_at <= date_to]
        return items[skip : skip + limit], len(items)

    async def get_by_id(self, entity_id):
        for route in self.routes:
            if route.id == entity_id:
                return route
        return self.route if self.route and self.route.id == entity_id else None

    async def get_route_points(self, route_id):
        return self.route_points.get(route_id, [])

    async def save_route(self, route):
        return route

    async def replace_route_points(self, route_id, points):
        self.route_points[route_id] = list(points)
        return None

    async def delete(self, route):
        self.routes = [item for item in self.routes if item.id != route.id]
        self.route_points.pop(route.id, None)
        return True


class FakePoeRepository:
    def __init__(self, pois):
        self.pois = pois

    async def list_candidates(self, **kwargs):
        return self.pois

    async def get_by_ids(self, ids):
        return {poe.id: poe for poe in self.pois if poe.id in ids}


def make_saved_route(user_id) -> Route:
    return Route(
        id="route_1",
        user_id=user_id,
        title="Saved route",
        description="Desc",
        city_id="city_spb",
        status=RouteStatus.DRAFT,
        source=RouteSource.GENERATED,
        duration_minutes=120,
        distance_meters=2500,
        pace=Pace.MEDIUM,
        start_lat=59.93,
        start_lng=30.31,
        start_address="Nevsky, 1",
        accessibility_score=80,
        created_at=datetime.datetime(2026, 5, 1, 10, 0),
    )


def test_pace_constants_cover_all_values():
    assert PACE_WALKING_SPEED_METERS_PER_MINUTE[Pace.SLOW] < PACE_WALKING_SPEED_METERS_PER_MINUTE[Pace.FAST]


@pytest.mark.asyncio
async def test_generate_route_returns_generated_route(route_poes, route_request_factory, sample_user):
    service = RouteService(FakeRouteRepository(), FakePoeRepository(route_poes))
    response = await service.generate_route(route_request_factory(), user_id=sample_user.id)
    assert response.data.id.startswith("route_")
    assert len(response.data.points) >= 1
    assert response.data.distance_meters > 0


@pytest.mark.asyncio
async def test_generate_route_raises_when_no_candidates(route_request_factory, sample_user):
    service = RouteService(FakeRouteRepository(), FakePoeRepository([]))
    with pytest.raises(HTTPException) as exc:
        await service.generate_route(route_request_factory(), user_id=sample_user.id)
    assert exc.value.status_code == 404


@pytest.mark.asyncio
async def test_get_routes_returns_paginated_items(sample_user):
    repository = FakeRouteRepository()
    repository.routes = [make_saved_route(user_id=sample_user.id)]
    response = await RouteService(repository, FakePoeRepository([])).get_routes(
        user_id=sample_user.id,
        page=1,
        limit=20,
    )
    assert response.meta.total == 1
    assert response.data[0].id == "route_1"


@pytest.mark.asyncio
async def test_get_route_returns_detail(route_poes, sample_user):
    repository = FakeRouteRepository()
    route = make_saved_route(user_id=sample_user.id)
    repository.routes = [route]
    repository.route_points[route.id] = [
        RoutePoint(route_id=route.id, order=1, poe_id=route_poes[0].id, planned_stop_minutes=30),
    ]
    response = await RouteService(repository, FakePoeRepository(route_poes)).get_route(
        route_id=route.id,
        user_id=sample_user.id,
    )
    assert response.data.id == route.id
    assert response.data.points[0].poe.title == route_poes[0].title


@pytest.mark.asyncio
async def test_get_route_raises_for_foreign_user(sample_user):
    repository = FakeRouteRepository()
    repository.routes = [make_saved_route(user_id=uuid.uuid4())]
    with pytest.raises(HTTPException) as exc:
        await RouteService(repository, FakePoeRepository([])).get_route(
            route_id="route_1",
            user_id=sample_user.id,
        )
    assert exc.value.status_code == 403


@pytest.mark.asyncio
async def test_save_route_updates_status(sample_user):
    repository = FakeRouteRepository()
    route = make_saved_route(user_id=sample_user.id)
    repository.routes = [route]
    response = await RouteService(repository, FakePoeRepository([])).save_route(
        route_id=route.id,
        user_id=sample_user.id,
    )
    assert response.data.status == RouteStatus.SAVED


@pytest.mark.asyncio
async def test_start_progress_finish_route(sample_user):
    repository = FakeRouteRepository()
    route = make_saved_route(user_id=sample_user.id)
    repository.routes = [route]
    repository.route_points[route.id] = [
        RoutePoint(route_id=route.id, order=1, poe_id="poe_1", planned_stop_minutes=20),
        RoutePoint(route_id=route.id, order=2, poe_id="poe_2", planned_stop_minutes=20),
    ]
    service = RouteService(repository, FakePoeRepository([]))

    started = await service.start_route(route_id=route.id, user_id=sample_user.id)
    assert started.data.status == RouteStatus.IN_PROGRESS

    progressed = await service.progress_route(
        route_id=route.id,
        user_id=sample_user.id,
        progress_in=RouteProgressUpdate(order=2),
    )
    assert progressed.data.progress_order == 2

    finished = await service.finish_route(route_id=route.id, user_id=sample_user.id)
    assert finished.data.status == RouteStatus.COMPLETED
    assert finished.data.completed_at is not None


@pytest.mark.asyncio
async def test_update_route_replaces_points(route_poes, sample_user):
    repository = FakeRouteRepository()
    route = make_saved_route(user_id=sample_user.id)
    repository.routes = [route]
    repository.route_points[route.id] = [
        RoutePoint(route_id=route.id, order=1, poe_id=route_poes[0].id, planned_stop_minutes=10),
    ]
    service = RouteService(repository, FakePoeRepository(route_poes))

    response = await service.update_route(
        route_id=route.id,
        user_id=sample_user.id,
        route_in=RouteManualUpdate.model_validate({
            "title": "Manual route",
            "points": [
                {"poe_id": route_poes[1].id, "planned_stop_minutes": 15},
                {"poe_id": route_poes[0].id, "planned_stop_minutes": 20},
            ],
        }),
    )
    assert response.data.title == "Manual route"
    assert response.data.source == RouteSource.MANUAL
    assert len(response.data.points) == 2


@pytest.mark.asyncio
async def test_delete_route_removes_route(sample_user):
    repository = FakeRouteRepository()
    route = make_saved_route(user_id=sample_user.id)
    repository.routes = [route]
    await RouteService(repository, FakePoeRepository([])).delete_route(
        route_id=route.id,
        user_id=sample_user.id,
    )
    assert repository.routes == []


def test_select_points_prefers_matching_interests(route_poes, route_request_factory):
    service = RouteService(FakeRouteRepository(), FakePoeRepository(route_poes))
    selected = service._select_points(route_request_factory(interests=["art"]), route_poes.copy())
    assert selected[0].category == "art"


def test_select_points_falls_back_to_candidates_when_interest_not_found(route_poes, route_request_factory):
    service = RouteService(FakeRouteRepository(), FakePoeRepository(route_poes))
    selected = service._select_points(route_request_factory(interests=["museum"]), route_poes.copy())
    assert len(selected) >= 1


def test_route_distance_is_non_negative(route_poes, route_request_factory):
    service = RouteService(FakeRouteRepository(), FakePoeRepository(route_poes))
    total = service._route_distance(route_request_factory(), route_poes[:2])
    assert total >= 0


def test_accessibility_score_handles_empty():
    service = RouteService(FakeRouteRepository(), FakePoeRepository([]))
    assert service._accessibility_score([]) == 0


def test_accessibility_score_prefers_accessible_pois(route_poes):
    service = RouteService(FakeRouteRepository(), FakePoeRepository(route_poes))
    score = service._accessibility_score(route_poes[:2])
    assert score >= 70


def test_build_title_with_interests(route_poes, route_request_factory):
    service = RouteService(FakeRouteRepository(), FakePoeRepository(route_poes))
    title = service._build_title(route_request_factory(interests=["coffee", "art"]), route_poes)
    assert "coffee" in title.lower()


def test_build_title_with_points_only(route_poes, route_request_factory):
    service = RouteService(FakeRouteRepository(), FakePoeRepository(route_poes))
    title = service._build_title(route_request_factory(interests=[]), route_poes)
    assert route_poes[0].category in title


def test_build_title_default_when_empty(route_request_factory):
    service = RouteService(FakeRouteRepository(), FakePoeRepository([]))
    assert service._build_title(route_request_factory(interests=[]), []) == "Новый маршрут"
