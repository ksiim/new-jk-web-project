import uuid
from collections.abc import Sequence

from sqlalchemy import func, select, update

from src.app.db.models.booking import Booking, BookingStatus
from src.app.db.models.tour import SlotStatus, Tour, TourSlot
from src.app.repositories.base import BaseRepository


class BookingRepository(BaseRepository[Booking]):
    model = Booking

    async def get_tour(self, tour_id: str) -> Tour | None:
        return await self.session.get(Tour, tour_id)

    async def get_slot(self, slot_id: str) -> TourSlot | None:
        return await self.session.get(TourSlot, slot_id)

    async def get_by_idempotency_key(
        self,
        *,
        user_id: uuid.UUID,
        idempotency_key: str,
    ) -> Booking | None:
        statement = select(Booking).where(
            Booking.user_id == user_id,
            Booking.idempotency_key == idempotency_key,
        )
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()

    async def list_user_bookings(
        self,
        *,
        user_id: uuid.UUID,
        skip: int,
        limit: int,
        status: BookingStatus | None = None,
    ) -> tuple[Sequence[Booking], int]:
        statement = select(Booking).where(Booking.user_id == user_id)
        if status:
            statement = statement.where(Booking.status == status)
        statement = statement.order_by(Booking.created_at.desc())
        items = (await self.session.execute(statement.offset(skip).limit(limit))).scalars().all()

        total_statement = (
            select(func.count())
            .select_from(Booking)
            .where(Booking.user_id == user_id)
        )
        if status:
            total_statement = total_statement.where(Booking.status == status)
        total = (await self.session.execute(total_statement)).scalar_one()
        return items, total

    async def add_booking_with_slot_update(
        self,
        *,
        booking: Booking,
        slot: TourSlot,
    ) -> Booking | None:
        statement = (
            update(TourSlot)
            .where(
                TourSlot.id == slot.id,
                TourSlot.status == SlotStatus.AVAILABLE,
                TourSlot.available_capacity >= booking.participants_count,
            )
            .values(available_capacity=TourSlot.available_capacity - booking.participants_count)
            .returning(TourSlot.available_capacity)
        )
        remaining_capacity = (await self.session.execute(statement)).scalar_one_or_none()
        if remaining_capacity is None:
            await self.session.rollback()
            return None
        if remaining_capacity == 0:
            await self.session.execute(
                update(TourSlot)
                .where(TourSlot.id == slot.id)
                .values(status=SlotStatus.SOLD_OUT),
            )
        self.session.add(booking)
        await self.session.commit()
        return booking

    async def save_booking_and_slot(
        self,
        *,
        booking: Booking,
        slot: TourSlot | None = None,
    ) -> Booking:
        if slot:
            self.session.add(slot)
        self.session.add(booking)
        await self.session.commit()
        return booking
