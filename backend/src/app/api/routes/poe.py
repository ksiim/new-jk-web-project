from typing import Annotated

from fastapi import APIRouter, Query

from src.app.api.dependencies.common import PoeServiceDep
from src.app.api.dependencies.pagination import PaginationDep
from src.app.db.models.poe import PoeCreate, PoeDetail, PoeMapItem, PoesPublic
from src.app.db.schemas import DetailResponse

router = APIRouter()
map_router = APIRouter()


@router.get("", response_model=PoesPublic)
@router.get("/", response_model=PoesPublic, include_in_schema=False)
async def read_poes(
    poe_service: PoeServiceDep,
    pagination: PaginationDep,
    city_id: str | None = None,
    category: str | None = None,
    tags: Annotated[str | None, Query(description="Comma-separated tags")] = None,
    lat: float | None = None,
    lng: float | None = None,
    radius: int | None = Query(default=None, ge=1),
    wheelchair_accessible: bool | None = None,
    avoid_stairs: bool | None = None,
) -> PoesPublic:
    return await poe_service.get_poes(
        city_id=city_id,
        category=category,
        tags=tags,
        lat=lat,
        lng=lng,
        radius=radius,
        wheelchair_accessible=wheelchair_accessible,
        avoid_stairs=avoid_stairs,
        page=pagination.page,
        limit=pagination.limit,
    )


@router.post("", response_model=DetailResponse[PoeDetail], status_code=201)
async def create_poe(
    poe_service: PoeServiceDep,
    poe_in: PoeCreate,
) -> DetailResponse[PoeDetail]:
    return await poe_service.create_poe(poe_in)


@router.get("/{poe_id}", response_model=DetailResponse[PoeDetail])
async def read_poe(
    poe_service: PoeServiceDep,
    poe_id: str,
) -> DetailResponse[PoeDetail]:
    return await poe_service.get_poe(poe_id)


@map_router.get("/poes", response_model=DetailResponse[list[PoeMapItem]])
@map_router.get("/poe", response_model=DetailResponse[list[PoeMapItem]], include_in_schema=False)
async def read_map_poes(
    poe_service: PoeServiceDep,
    city_id: str | None = None,
    bbox: str | None = Query(default=None, description="min_lng,min_lat,max_lng,max_lat"),
    zoom: int | None = None,
    category: str | None = None,
    tags: Annotated[str | None, Query(description="Comma-separated tags")] = None,
    wheelchair_accessible: bool | None = None,
) -> DetailResponse[list[PoeMapItem]]:
    _ = zoom
    return await poe_service.get_map_poes(
        city_id=city_id,
        bbox=bbox,
        category=category,
        tags=tags,
        wheelchair_accessible=wheelchair_accessible,
    )
