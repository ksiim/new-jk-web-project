import datetime
from collections.abc import Sequence

from fastapi import HTTPException

from src.app.db.models.tour import (
    GuideDetail,
    GuidePublic,
    Location,
    Price,
    RoutePreview,
    SlotStatus,
    Tour,
    TourAccessibility,
    TourCreate,
    TourDetail,
    TourFormat,
    TourPublic,
    TourResponse,
    TourSlot,
    TourSlotCreate,
    TourSlotPublic,
    TourSlotResponse,
    TourSlotsResponse,
    ToursPublic,
)
from src.app.db.schemas import DetailResponse, PaginationMeta
from src.app.repositories.tour import TourRepository
from src.app.service.base import BaseService


def normalize_datetime(value: datetime.datetime) -> datetime.datetime:
    if value.tzinfo is None:
        return value
    return value.astimezone(datetime.UTC).replace(tzinfo=None)


def tour_to_guide(tour: Tour) -> GuidePublic:
    return GuidePublic(
        id=tour.guide_id,
        name=tour.guide_name,
        rating=tour.guide_rating,
        reviews_count=tour.guide_reviews_count,
    )


def tour_to_guide_detail(tour: Tour) -> GuideDetail:
    return GuideDetail(
        id=tour.guide_id,
        name=tour.guide_name,
        avatar_url=tour.guide_avatar_url,
        rating=tour.guide_rating,
        reviews_count=tour.guide_reviews_count,
        bio=tour.guide_bio,
    )


def tour_to_price(tour: Tour) -> Price:
    return Price(amount=tour.price_amount, currency=tour.price_currency)


def slot_to_price(slot: TourSlot) -> Price:
    return Price(amount=slot.price_amount, currency=slot.price_currency)


def tour_to_accessibility(tour: Tour) -> TourAccessibility:
    return TourAccessibility(
        wheelchair_accessible=tour.wheelchair_accessible,
        avoid_stairs_possible=tour.avoid_stairs_possible,
    )


def tour_to_public(tour: Tour) -> TourPublic:
    return TourPublic(
        id=tour.id,
        title=tour.title,
        short_description=tour.description,
        city_id=tour.city_id,
        format=tour.format,
        language=tour.language,
        duration_minutes=tour.duration_minutes,
        price=tour_to_price(tour),
        guide=tour_to_guide(tour),
        rating=tour.rating,
        reviews_count=tour.reviews_count,
        cover_image_url=tour.cover_image_url,
        accessibility=tour_to_accessibility(tour),
    )


def tour_to_detail(tour: Tour) -> TourDetail:
    return TourDetail(
        id=tour.id,
        title=tour.title,
        description=tour.description,
        city_id=tour.city_id,
        rating=tour.rating,
        reviews_count=tour.reviews_count,
        guide=tour_to_guide_detail(tour),
        format=tour.format,
        language=tour.language,
        duration_minutes=tour.duration_minutes,
        group_size_max=tour.group_size_max,
        price=tour_to_price(tour),
        tags=tour.tags,
        meeting_point=Location(
            lat=tour.meeting_lat,
            lng=tour.meeting_lng,
            address=tour.meeting_address,
        ),
        route_preview=RoutePreview(
            distance_meters=tour.route_distance_meters,
            points_count=tour.route_points_count,
        ),
        accessibility=tour_to_accessibility(tour),
        images=tour.images,
        cancellation_policy=tour.cancellation_policy,
    )


def slot_to_public(slot: TourSlot) -> TourSlotPublic:
    status = slot.status
    if slot.available_capacity == 0 and status == SlotStatus.AVAILABLE:
        status = SlotStatus.SOLD_OUT
    return TourSlotPublic(
        id=slot.id,
        starts_at=slot.starts_at,
        ends_at=slot.ends_at,
        available_capacity=slot.available_capacity,
        price=slot_to_price(slot),
        status=status,
    )


class TourService(BaseService[TourRepository]):
    async def create_tour(self, tour_in: TourCreate) -> TourResponse:
        tour = await self.repository.add(Tour.model_validate(tour_in))
        return DetailResponse(data=tour_to_detail(tour))

    async def get_tours(
        self,
        *,
        page: int,
        limit: int,
        city_id: str | None = None,
        date: datetime.date | None = None,
        format: TourFormat | None = None,
        language: str | None = None,
        min_price: int | None = None,
        max_price: int | None = None,
        duration_min: int | None = None,
        duration_max: int | None = None,
        wheelchair_accessible: bool | None = None,
    ) -> ToursPublic:
        tours, total = await self.repository.list_tours(
            skip=(page - 1) * limit,
            limit=limit,
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
        tours = await self._apply_runtime_ratings(tours)
        return ToursPublic(
            data=[tour_to_public(tour) for tour in tours],
            meta=PaginationMeta.create(page=page, limit=limit, total=total),
        )

    async def get_tour(self, tour_id: str) -> TourResponse:
        tour = await self.repository.get_by_id(tour_id)
        if not tour:
            raise HTTPException(status_code=404, detail="Tour not found")
        tour = await self._apply_runtime_rating(tour)
        return DetailResponse(data=tour_to_detail(tour))

    async def create_slot(
        self,
        *,
        tour_id: str,
        slot_in: TourSlotCreate,
    ) -> TourSlotResponse:
        tour = await self.repository.get_by_id(tour_id)
        if not tour:
            raise HTTPException(status_code=404, detail="Tour not found")
        starts_at = normalize_datetime(slot_in.starts_at)
        ends_at = normalize_datetime(slot_in.ends_at)
        if ends_at <= starts_at:
            raise HTTPException(status_code=422, detail="ends_at must be after starts_at")
        if slot_in.available_capacity > tour.group_size_max:
            raise HTTPException(status_code=422, detail="available_capacity exceeds group_size_max")
        if slot_in.status == SlotStatus.SOLD_OUT and slot_in.available_capacity > 0:
            raise HTTPException(
                status_code=422,
                detail="sold_out slot cannot have available capacity",
            )
        status = SlotStatus.SOLD_OUT if slot_in.available_capacity == 0 else slot_in.status
        slot = TourSlot(
            tour_id=tour_id,
            starts_at=starts_at,
            ends_at=ends_at,
            available_capacity=slot_in.available_capacity,
            price_amount=slot_in.price.amount,
            price_currency=slot_in.price.currency,
            status=status,
        )
        created_slot = await self.repository.add_slot(slot)
        return DetailResponse(data=slot_to_public(created_slot))

    async def get_slots(
        self,
        *,
        tour_id: str,
        date_from: datetime.datetime | None = None,
        date_to: datetime.datetime | None = None,
    ) -> TourSlotsResponse:
        tour = await self.repository.get_by_id(tour_id)
        if not tour:
            raise HTTPException(status_code=404, detail="Tour not found")
        slots = await self.repository.list_slots(
            tour_id=tour_id,
            date_from=normalize_datetime(date_from) if date_from else None,
            date_to=normalize_datetime(date_to) if date_to else None,
        )
        return DetailResponse(data=[slot_to_public(slot) for slot in slots])

    async def _apply_runtime_ratings(self, tours: Sequence[Tour]) -> list[Tour]:
        if not tours:
            return []
        tour_ids = [tour.id for tour in tours]
        guide_ids = list(dict.fromkeys(tour.guide_id for tour in tours))
        tour_stats = await self.repository.get_tour_rating_stats_map(tour_ids=tour_ids)
        guide_stats = await self.repository.get_guide_rating_stats_map(guide_ids=guide_ids)
        return [
            self._tour_with_rating_stats(
                tour,
                rating_stats=tour_stats.get(tour.id),
                guide_rating_stats=guide_stats.get(tour.guide_id),
            )
            for tour in tours
        ]

    async def _apply_runtime_rating(self, tour: Tour) -> Tour:
        [enriched_tour] = await self._apply_runtime_ratings([tour])
        return enriched_tour

    def _tour_with_rating_stats(
        self,
        tour: Tour,
        *,
        rating_stats: tuple[float, int] | None,
        guide_rating_stats: tuple[float, int] | None,
    ) -> Tour:
        rating, reviews_count = rating_stats or (0.0, 0)
        guide_rating, guide_reviews_count = guide_rating_stats or (0.0, 0)
        return tour.model_copy(
            update={
                "rating": rating,
                "reviews_count": reviews_count,
                "guide_rating": guide_rating,
                "guide_reviews_count": guide_reviews_count,
            },
        )
