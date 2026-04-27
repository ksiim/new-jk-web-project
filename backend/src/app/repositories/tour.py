import datetime
from collections.abc import Sequence

from sqlalchemy import Select, exists, func, select

from src.app.db.models.review import Review, ReviewEntityType
from src.app.db.models.tour import SlotStatus, Tour, TourFormat, TourSlot
from src.app.repositories.base import BaseRepository


class TourRepository(BaseRepository[Tour]):
    model = Tour

    def _filtered_tours_statement(
        self,
        *,
        city_id: str | None = None,
        format: TourFormat | None = None,
        language: str | None = None,
        min_price: int | None = None,
        max_price: int | None = None,
        duration_min: int | None = None,
        duration_max: int | None = None,
        wheelchair_accessible: bool | None = None,
        date: datetime.date | None = None,
    ) -> Select[tuple[Tour]]:
        statement = select(Tour)
        if city_id:
            statement = statement.where(Tour.city_id == city_id)
        if format:
            statement = statement.where(Tour.format == format)
        if language:
            statement = statement.where(Tour.language == language)
        if min_price is not None:
            statement = statement.where(Tour.price_amount >= min_price)
        if max_price is not None:
            statement = statement.where(Tour.price_amount <= max_price)
        if duration_min is not None:
            statement = statement.where(Tour.duration_minutes >= duration_min)
        if duration_max is not None:
            statement = statement.where(Tour.duration_minutes <= duration_max)
        if wheelchair_accessible is not None:
            statement = statement.where(Tour.wheelchair_accessible == wheelchair_accessible)
        if date:
            start = datetime.datetime.combine(date, datetime.time.min)
            end = datetime.datetime.combine(date, datetime.time.max)
            statement = statement.where(
                exists().where(
                    TourSlot.tour_id == Tour.id,
                    TourSlot.starts_at >= start,
                    TourSlot.starts_at <= end,
                    TourSlot.status == SlotStatus.AVAILABLE,
                    TourSlot.available_capacity > 0,
                ),
            )
        return statement

    async def list_tours(
        self,
        *,
        skip: int,
        limit: int,
        city_id: str | None = None,
        format: TourFormat | None = None,
        language: str | None = None,
        min_price: int | None = None,
        max_price: int | None = None,
        duration_min: int | None = None,
        duration_max: int | None = None,
        wheelchair_accessible: bool | None = None,
        date: datetime.date | None = None,
    ) -> tuple[Sequence[Tour], int]:
        statement = self._filtered_tours_statement(
            city_id=city_id,
            format=format,
            language=language,
            min_price=min_price,
            max_price=max_price,
            duration_min=duration_min,
            duration_max=duration_max,
            wheelchair_accessible=wheelchair_accessible,
            date=date,
        )
        items = (await self.session.execute(statement.offset(skip).limit(limit))).scalars().all()
        total_statement = select(func.count()).select_from(statement.subquery())
        total = (await self.session.execute(total_statement)).scalar_one()
        return items, total

    async def add_slot(self, slot: TourSlot) -> TourSlot:
        self.session.add(slot)
        await self.session.commit()
        await self.session.refresh(slot)
        return slot

    async def get_slot(self, slot_id: str) -> TourSlot | None:
        return await self.session.get(TourSlot, slot_id)

    async def list_slots(
        self,
        *,
        tour_id: str,
        date_from: datetime.datetime | None = None,
        date_to: datetime.datetime | None = None,
    ) -> Sequence[TourSlot]:
        statement = select(TourSlot).where(TourSlot.tour_id == tour_id)
        if date_from:
            statement = statement.where(TourSlot.starts_at >= date_from)
        if date_to:
            statement = statement.where(TourSlot.starts_at <= date_to)
        statement = statement.order_by(TourSlot.starts_at)
        result = await self.session.execute(statement)
        return result.scalars().all()

    async def has_available_slot_on_date(self, *, tour_id: str, date: datetime.date) -> bool:
        start = datetime.datetime.combine(date, datetime.time.min)
        end = datetime.datetime.combine(date, datetime.time.max)
        statement = select(TourSlot.id).where(
            TourSlot.tour_id == tour_id,
            TourSlot.starts_at >= start,
            TourSlot.starts_at <= end,
            TourSlot.status == SlotStatus.AVAILABLE,
            TourSlot.available_capacity > 0,
        )
        result = await self.session.execute(statement)
        return result.first() is not None

    async def get_tour_rating_stats_map(
        self,
        *,
        tour_ids: Sequence[str],
    ) -> dict[str, tuple[float, int]]:
        if not tour_ids:
            return {}
        statement = (
            select(
                Review.entity_id,
                func.coalesce(func.avg(Review.rating), 0.0),
                func.count(Review.id),
            )
            .where(
                Review.entity_type == ReviewEntityType.TOUR,
                Review.entity_id.in_(tour_ids),
            )
            .group_by(Review.entity_id)
        )
        rows = (await self.session.execute(statement)).all()
        return {
            entity_id: (float(avg_rating), int(reviews_count))
            for entity_id, avg_rating, reviews_count in rows
        }

    async def get_guide_rating_stats_map(
        self,
        *,
        guide_ids: Sequence[str],
    ) -> dict[str, tuple[float, int]]:
        if not guide_ids:
            return {}
        statement = (
            select(
                Tour.guide_id,
                func.coalesce(func.avg(Review.rating), 0.0),
                func.count(Review.id),
            )
            .join(Review, Review.entity_id == Tour.id)
            .where(
                Review.entity_type == ReviewEntityType.TOUR,
                Tour.guide_id.in_(guide_ids),
            )
            .group_by(Tour.guide_id)
        )
        rows = (await self.session.execute(statement)).all()
        return {
            guide_id: (float(avg_rating), int(reviews_count))
            for guide_id, avg_rating, reviews_count in rows
        }
