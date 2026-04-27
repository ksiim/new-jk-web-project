import datetime

from fastapi import APIRouter, Query

from src.app.api.dependencies.common import TourServiceDep
from src.app.api.dependencies.pagination import PaginationDep
from src.app.db.models.tour import (
    TourCreate,
    TourFormat,
    TourResponse,
    TourSlotCreate,
    TourSlotResponse,
    TourSlotsResponse,
    ToursPublic,
)

router = APIRouter()


@router.get("", response_model=ToursPublic)
@router.get("/", response_model=ToursPublic, include_in_schema=False)
async def read_tours(
    tour_service: TourServiceDep,
    pagination: PaginationDep,
    city_id: str | None = None,
    date: datetime.date | None = None,
    format: TourFormat | None = None,
    language: str | None = None,
    min_price: int | None = Query(default=None, ge=0),
    max_price: int | None = Query(default=None, ge=0),
    duration_min: int | None = Query(default=None, ge=1),
    duration_max: int | None = Query(default=None, ge=1),
    wheelchair_accessible: bool | None = None,
) -> ToursPublic:
    return await tour_service.get_tours(
        page=pagination.page,
        limit=pagination.limit,
        city_id=city_id,
        date=date,
        format=format,
        language=language,
        min_price=min_price,
        max_price=max_price,
        duration_min=duration_min,
        duration_max=duration_max,
        wheelchair_accessible=wheelchair_accessible,
    )


@router.post("", response_model=TourResponse, status_code=201)
async def create_tour(
    tour_service: TourServiceDep,
    tour_in: TourCreate,
) -> TourResponse:
    return await tour_service.create_tour(tour_in)


@router.get("/{tour_id}", response_model=TourResponse)
async def read_tour(
    tour_service: TourServiceDep,
    tour_id: str,
) -> TourResponse:
    return await tour_service.get_tour(tour_id)


@router.get("/{tour_id}/slots", response_model=TourSlotsResponse)
async def read_tour_slots(
    tour_service: TourServiceDep,
    tour_id: str,
    date_from: datetime.datetime | None = None,
    date_to: datetime.datetime | None = None,
) -> TourSlotsResponse:
    return await tour_service.get_slots(
        tour_id=tour_id,
        date_from=date_from,
        date_to=date_to,
    )


@router.post("/{tour_id}/slots", response_model=TourSlotResponse, status_code=201)
async def create_tour_slot(
    tour_service: TourServiceDep,
    tour_id: str,
    slot_in: TourSlotCreate,
) -> TourSlotResponse:
    return await tour_service.create_slot(tour_id=tour_id, slot_in=slot_in)
