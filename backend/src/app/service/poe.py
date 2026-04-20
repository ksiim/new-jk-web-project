import math
from collections.abc import Sequence

from fastapi import HTTPException
from pydantic import ValidationError

from src.app.db.models.poe import (
    Location,
    OpeningHoursItem,
    Poe,
    PoeAccessibility,
    PoeCreate,
    PoeDetail,
    PoeMapItem,
    PoePublic,
    PoesPublic,
)
from src.app.db.schemas import DetailResponse, PaginationMeta
from src.app.repositories.poe import PoeRepository
from src.app.service.base import BaseService


def distance_meters(lat1: float, lng1: float, lat2: float, lng2: float) -> int:
    radius = 6_371_000
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lng = math.radians(lng2 - lng1)
    a = (
        math.sin(delta_lat / 2) ** 2
        + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lng / 2) ** 2
    )
    return round(radius * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a)))


def poe_to_public(poe: Poe) -> PoePublic:
    return PoePublic(
        id=poe.id,
        title=poe.title,
        description=poe.description,
        category=poe.category,
        tags=poe.tags,
        location=Location(lat=poe.lat, lng=poe.lng, address=poe.address),
        accessibility=PoeAccessibility(
            wheelchair_accessible=poe.wheelchair_accessible,
            has_ramp=poe.has_ramp,
            has_stairs=poe.has_stairs,
        ),
        rating=poe.rating,
        reviews_count=poe.reviews_count,
        duration_minutes=poe.duration_minutes,
        images=poe.images,
    )


def poe_to_detail(poe: Poe) -> PoeDetail:
    public = poe_to_public(poe)
    return PoeDetail(
        **public.model_dump(),
        opening_hours=parse_opening_hours(poe.opening_hours),
    )


def parse_opening_hours(opening_hours: Sequence[dict[str, str]]) -> list[OpeningHoursItem]:
    parsed_hours: list[OpeningHoursItem] = []
    for item in opening_hours:
        try:
            parsed_hours.append(OpeningHoursItem.model_validate(item))
        except ValidationError:
            continue
    return parsed_hours


def filter_by_tags(poes: Sequence[Poe], tags: set[str]) -> list[Poe]:
    if not tags:
        return list(poes)
    return [poe for poe in poes if tags.intersection({tag.lower() for tag in poe.tags})]


def filter_by_radius(
    poes: Sequence[Poe],
    *,
    lat: float | None,
    lng: float | None,
    radius: int | None,
) -> list[Poe]:
    if lat is None or lng is None or radius is None:
        return list(poes)
    return [poe for poe in poes if distance_meters(lat, lng, poe.lat, poe.lng) <= radius]


def filter_by_bbox(poes: Sequence[Poe], bbox: str | None) -> list[Poe]:
    if not bbox:
        return list(poes)
    try:
        min_lng, min_lat, max_lng, max_lat = [float(part) for part in bbox.split(",")]
    except ValueError:
        raise HTTPException(status_code=422, detail="bbox must be min_lng,min_lat,max_lng,max_lat")
    return [
        poe
        for poe in poes
        if min_lat <= poe.lat <= max_lat and min_lng <= poe.lng <= max_lng
    ]


class PoeService(BaseService[PoeRepository]):
    async def create_poe(self, poe_in: PoeCreate) -> DetailResponse[PoeDetail]:
        poe_data = poe_in.model_dump(mode="json", by_alias=True)
        poe = await self.repository.add(Poe.model_validate(poe_data))
        return DetailResponse(data=poe_to_detail(poe))

    async def get_poe(self, poe_id: str) -> DetailResponse[PoeDetail]:
        poe = await self.repository.get_by_id(poe_id)
        if not poe:
            raise HTTPException(status_code=404, detail="POE not found")
        return DetailResponse(data=poe_to_detail(poe))

    async def get_poes(
        self,
        *,
        city_id: str | None,
        category: str | None,
        tags: str | None,
        lat: float | None,
        lng: float | None,
        radius: int | None,
        wheelchair_accessible: bool | None,
        avoid_stairs: bool | None,
        page: int,
        limit: int,
    ) -> PoesPublic:
        poes = await self.repository.list_candidates(
            city_id=city_id,
            category=category,
            wheelchair_accessible=wheelchair_accessible,
            avoid_stairs=avoid_stairs,
        )
        parsed_tags = {tag.strip().lower() for tag in (tags or "").split(",") if tag.strip()}
        filtered = filter_by_radius(
            filter_by_tags(poes, parsed_tags),
            lat=lat,
            lng=lng,
            radius=radius,
        )
        total = len(filtered)
        start = (page - 1) * limit
        return PoesPublic(
            data=[poe_to_public(poe) for poe in filtered[start : start + limit]],
            meta=PaginationMeta.create(page=page, limit=limit, total=total),
        )

    async def get_map_poes(
        self,
        *,
        city_id: str | None,
        bbox: str | None,
        category: str | None,
        tags: str | None,
        wheelchair_accessible: bool | None,
    ) -> DetailResponse[list[PoeMapItem]]:
        poes = await self.repository.list_candidates(
            city_id=city_id,
            category=category,
            wheelchair_accessible=wheelchair_accessible,
        )
        parsed_tags = {tag.strip().lower() for tag in (tags or "").split(",") if tag.strip()}
        filtered = filter_by_bbox(filter_by_tags(poes, parsed_tags), bbox)
        return DetailResponse(
            data=[
                PoeMapItem(
                    id=poe.id,
                    title=poe.title,
                    category=poe.category,
                    lat=poe.lat,
                    lng=poe.lng,
                    badge=f"{poe.rating:.1f}",
                    is_accessible=poe.wheelchair_accessible,
                )
                for poe in filtered
            ],
        )
