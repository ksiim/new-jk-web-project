from __future__ import annotations

import uuid

import pytest
from fastapi import HTTPException

from src.app.db.models.booking import BookingCancelRequest, BookingCreate, BookingStatus, RefundStatus
from src.app.db.models.tour import SlotStatus
from src.app.service.booking import (
    BookingService,
    booking_price,
    booking_to_created,
    booking_to_detail,
    booking_to_public,
)


class FakeBookingRepository:
    def __init__(self, *, tour=None, slot=None, booking=None):
        self.tour = tour
        self.slot = slot
        self.booking = booking
        self.saved_slot = None
        self.saved_booking = None

    async def get_tour(self, tour_id: str):
        return self.tour if self.tour and self.tour.id == tour_id else None

    async def get_slot(self, slot_id: str):
        return self.slot if self.slot and self.slot.id == slot_id else None

    async def get_by_id(self, booking_id: str):
        return self.booking if self.booking and self.booking.id == booking_id else None

    async def get_by_idempotency_key(self, *, user_id, idempotency_key):
        if (
            self.booking
            and self.booking.user_id == user_id
            and self.booking.idempotency_key == idempotency_key
        ):
            return self.booking
        return None

    async def add_booking_with_slot_update(self, *, booking, slot):
        if slot.status != SlotStatus.AVAILABLE or slot.available_capacity < booking.participants_count:
            return None
        slot.available_capacity -= booking.participants_count
        if slot.available_capacity == 0:
            slot.status = SlotStatus.SOLD_OUT
        self.booking = booking
        self.saved_slot = slot
        self.saved_booking = booking
        return booking

    async def save_booking_and_slot(self, *, booking, slot=None):
        self.booking = booking
        self.saved_booking = booking
        self.saved_slot = slot
        return booking

    async def list_user_bookings(self, *, user_id, skip, limit, status=None):
        bookings = [self.booking] if self.booking and self.booking.user_id == user_id else []
        if status is not None:
            bookings = [item for item in bookings if item.status == status]
        return bookings[skip : skip + limit], len(bookings)


def make_booking_create(**overrides) -> BookingCreate:
    payload = {
        "tour_id": "tour_1",
        "slot_id": "slot_1",
        "participants_count": 1,
        "contact_phone": None,
        "comment": None,
        "idempotency_key": None,
    }
    payload.update(overrides)
    return BookingCreate.model_validate(payload)


def make_cancel_request(**overrides) -> BookingCancelRequest:
    payload = {"reason": None}
    payload.update(overrides)
    return BookingCancelRequest.model_validate(payload)


def test_booking_mapping_helpers(sample_booking, sample_tour, sample_slot):
    assert booking_price(sample_booking).amount == sample_booking.price_total_amount
    created = booking_to_created(sample_booking)
    assert created.payment.payment_id == sample_booking.payment_id
    public = booking_to_public(sample_booking, sample_tour, sample_slot)
    assert public.tour.title == sample_tour.title
    detail = booking_to_detail(sample_booking, sample_tour, sample_slot)
    assert detail.slot.ends_at == sample_slot.ends_at


@pytest.mark.asyncio
async def test_create_booking_returns_existing_for_idempotency_key(sample_tour, sample_slot, sample_booking):
    sample_booking.idempotency_key = "same"
    repository = FakeBookingRepository(tour=sample_tour, slot=sample_slot, booking=sample_booking)
    response = await BookingService(repository).create_booking(
        booking_in=make_booking_create(
            tour_id=sample_tour.id,
            slot_id=sample_slot.id,
            idempotency_key="same",
        ),
        user_id=sample_booking.user_id,
        api_prefix="/api/v1",
    )
    assert response.data.id == sample_booking.id


@pytest.mark.asyncio
async def test_create_booking_raises_for_missing_tour(sample_slot, sample_user):
    repository = FakeBookingRepository(slot=sample_slot)
    with pytest.raises(HTTPException) as exc:
        await BookingService(repository).create_booking(
            booking_in=make_booking_create(tour_id="missing", slot_id=sample_slot.id),
            user_id=sample_user.id,
            api_prefix="/api/v1",
        )
    assert exc.value.status_code == 404


@pytest.mark.asyncio
async def test_create_booking_raises_for_missing_slot(sample_tour, sample_user):
    repository = FakeBookingRepository(tour=sample_tour)
    with pytest.raises(HTTPException) as exc:
        await BookingService(repository).create_booking(
            booking_in=make_booking_create(tour_id=sample_tour.id, slot_id="missing"),
            user_id=sample_user.id,
            api_prefix="/api/v1",
        )
    assert exc.value.status_code == 404


@pytest.mark.asyncio
async def test_create_booking_raises_for_unavailable_slot(sample_tour, sample_slot, sample_user):
    sample_slot.status = SlotStatus.SOLD_OUT
    repository = FakeBookingRepository(tour=sample_tour, slot=sample_slot)
    with pytest.raises(HTTPException) as exc:
        await BookingService(repository).create_booking(
            booking_in=make_booking_create(tour_id=sample_tour.id, slot_id=sample_slot.id),
            user_id=sample_user.id,
            api_prefix="/api/v1",
        )
    assert exc.value.status_code == 409


@pytest.mark.asyncio
async def test_create_booking_raises_for_not_enough_capacity(sample_tour, sample_slot, sample_user):
    sample_slot.available_capacity = 1
    repository = FakeBookingRepository(tour=sample_tour, slot=sample_slot)
    with pytest.raises(HTTPException) as exc:
        await BookingService(repository).create_booking(
            booking_in=make_booking_create(
                tour_id=sample_tour.id,
                slot_id=sample_slot.id,
                participants_count=2,
            ),
            user_id=sample_user.id,
            api_prefix="/api/v1",
        )
    assert exc.value.status_code == 409
    assert exc.value.detail["available_capacity"] == 1


@pytest.mark.asyncio
async def test_create_booking_raises_if_atomic_reservation_fails(sample_tour, sample_slot, sample_user):
    class FailingReservationRepository(FakeBookingRepository):
        async def add_booking_with_slot_update(self, *, booking, slot):
            return None

    repository = FailingReservationRepository(tour=sample_tour, slot=sample_slot)
    with pytest.raises(HTTPException) as exc:
        await BookingService(repository).create_booking(
            booking_in=make_booking_create(tour_id=sample_tour.id, slot_id=sample_slot.id),
            user_id=sample_user.id,
            api_prefix="/api/v1",
        )
    assert exc.value.status_code == 409


@pytest.mark.asyncio
async def test_create_booking_success_reduces_capacity_and_sets_payment_url(sample_tour, sample_slot, sample_user):
    repository = FakeBookingRepository(tour=sample_tour, slot=sample_slot)
    response = await BookingService(repository).create_booking(
        booking_in=make_booking_create(
            tour_id=sample_tour.id,
            slot_id=sample_slot.id,
            participants_count=3,
            contact_phone="123",
            comment="Hi",
            idempotency_key="abc",
        ),
        user_id=sample_user.id,
        api_prefix="/api/v1",
    )
    assert response.data.status == BookingStatus.PENDING_PAYMENT
    assert repository.slot.available_capacity == 0
    assert repository.slot.status == SlotStatus.SOLD_OUT
    assert response.data.payment.payment_url.endswith("/mock-payment/confirm")


@pytest.mark.asyncio
async def test_get_bookings_returns_paginated_items(sample_tour, sample_slot, sample_booking):
    repository = FakeBookingRepository(tour=sample_tour, slot=sample_slot, booking=sample_booking)
    response = await BookingService(repository).get_bookings(
        user_id=sample_booking.user_id,
        page=1,
        limit=20,
    )
    assert response.meta.total == 1
    assert response.data[0].id == sample_booking.id


@pytest.mark.asyncio
async def test_get_booking_returns_detail(sample_tour, sample_slot, sample_booking):
    repository = FakeBookingRepository(tour=sample_tour, slot=sample_slot, booking=sample_booking)
    response = await BookingService(repository).get_booking(
        booking_id=sample_booking.id,
        user_id=sample_booking.user_id,
    )
    assert response.data.id == sample_booking.id
    assert response.data.meeting_point["address"] == sample_tour.meeting_address


@pytest.mark.asyncio
async def test_get_booking_raises_for_missing(sample_user):
    repository = FakeBookingRepository()
    with pytest.raises(HTTPException) as exc:
        await BookingService(repository).get_booking(booking_id="missing", user_id=sample_user.id)
    assert exc.value.status_code == 404


@pytest.mark.asyncio
async def test_get_booking_raises_for_foreign_user(sample_booking, sample_user):
    repository = FakeBookingRepository(booking=sample_booking)
    foreign_user_id = uuid.uuid4()
    with pytest.raises(HTTPException) as exc:
        await BookingService(repository).get_booking(
            booking_id=sample_booking.id,
            user_id=foreign_user_id,
        )
    assert exc.value.status_code == 403


@pytest.mark.asyncio
async def test_confirm_mock_payment_is_idempotent(sample_booking):
    sample_booking.status = BookingStatus.CONFIRMED
    repository = FakeBookingRepository(booking=sample_booking)
    response = await BookingService(repository).confirm_mock_payment(
        booking_id=sample_booking.id,
        user_id=sample_booking.user_id,
    )
    assert response.data.status == BookingStatus.CONFIRMED


@pytest.mark.asyncio
async def test_confirm_mock_payment_raises_for_wrong_status(sample_booking):
    sample_booking.status = BookingStatus.CANCELLED
    repository = FakeBookingRepository(booking=sample_booking)
    with pytest.raises(HTTPException) as exc:
        await BookingService(repository).confirm_mock_payment(
            booking_id=sample_booking.id,
            user_id=sample_booking.user_id,
        )
    assert exc.value.status_code == 409


@pytest.mark.asyncio
async def test_confirm_mock_payment_success(sample_booking):
    repository = FakeBookingRepository(booking=sample_booking)
    response = await BookingService(repository).confirm_mock_payment(
        booking_id=sample_booking.id,
        user_id=sample_booking.user_id,
    )
    assert response.data.status == BookingStatus.CONFIRMED
    assert repository.booking.status == BookingStatus.CONFIRMED


@pytest.mark.asyncio
async def test_cancel_booking_returns_existing_cancelled(sample_booking):
    sample_booking.status = BookingStatus.CANCELLED
    sample_booking.refund_status = RefundStatus.NOT_REQUIRED
    repository = FakeBookingRepository(booking=sample_booking)
    response = await BookingService(repository).cancel_booking(
        booking_id=sample_booking.id,
        user_id=sample_booking.user_id,
        cancel_in=make_cancel_request(reason="n/a"),
    )
    assert response.data.status == BookingStatus.CANCELLED
    assert response.data.refund_status == RefundStatus.NOT_REQUIRED


@pytest.mark.asyncio
async def test_cancel_booking_raises_for_completed(sample_booking):
    sample_booking.status = BookingStatus.COMPLETED
    repository = FakeBookingRepository(booking=sample_booking)
    with pytest.raises(HTTPException) as exc:
        await BookingService(repository).cancel_booking(
            booking_id=sample_booking.id,
            user_id=sample_booking.user_id,
            cancel_in=make_cancel_request(reason="n/a"),
        )
    assert exc.value.status_code == 409


@pytest.mark.asyncio
async def test_cancel_booking_raises_for_missing_slot(sample_booking):
    repository = FakeBookingRepository(booking=sample_booking)
    with pytest.raises(HTTPException) as exc:
        await BookingService(repository).cancel_booking(
            booking_id=sample_booking.id,
            user_id=sample_booking.user_id,
            cancel_in=make_cancel_request(reason="n/a"),
        )
    assert exc.value.status_code == 404


@pytest.mark.asyncio
async def test_cancel_booking_sets_pending_refund_for_confirmed(sample_booking, sample_slot):
    sample_booking.status = BookingStatus.CONFIRMED
    sample_slot.status = SlotStatus.SOLD_OUT
    sample_slot.available_capacity = 0
    repository = FakeBookingRepository(booking=sample_booking, slot=sample_slot)
    response = await BookingService(repository).cancel_booking(
        booking_id=sample_booking.id,
        user_id=sample_booking.user_id,
        cancel_in=make_cancel_request(reason="n/a"),
    )
    assert response.data.refund_status == RefundStatus.PENDING
    assert repository.slot.available_capacity == 1
    assert repository.slot.status == SlotStatus.AVAILABLE


@pytest.mark.asyncio
async def test_cancel_booking_sets_not_required_refund_for_unpaid(sample_booking, sample_slot):
    sample_booking.status = BookingStatus.PENDING_PAYMENT
    repository = FakeBookingRepository(booking=sample_booking, slot=sample_slot)
    response = await BookingService(repository).cancel_booking(
        booking_id=sample_booking.id,
        user_id=sample_booking.user_id,
        cancel_in=make_cancel_request(reason="n/a"),
    )
    assert response.data.refund_status == RefundStatus.NOT_REQUIRED


@pytest.mark.asyncio
async def test_refund_mock_payment_is_idempotent(paid_cancelled_booking):
    paid_cancelled_booking.status = BookingStatus.REFUNDED
    paid_cancelled_booking.refund_status = RefundStatus.REFUNDED
    repository = FakeBookingRepository(booking=paid_cancelled_booking)
    response = await BookingService(repository).refund_mock_payment(
        booking_id=paid_cancelled_booking.id,
        user_id=paid_cancelled_booking.user_id,
    )
    assert response.data.status == BookingStatus.REFUNDED


@pytest.mark.asyncio
async def test_refund_mock_payment_raises_for_wrong_status(sample_booking):
    repository = FakeBookingRepository(booking=sample_booking)
    with pytest.raises(HTTPException) as exc:
        await BookingService(repository).refund_mock_payment(
            booking_id=sample_booking.id,
            user_id=sample_booking.user_id,
        )
    assert exc.value.status_code == 409


@pytest.mark.asyncio
async def test_refund_mock_payment_success(paid_cancelled_booking):
    repository = FakeBookingRepository(booking=paid_cancelled_booking)
    response = await BookingService(repository).refund_mock_payment(
        booking_id=paid_cancelled_booking.id,
        user_id=paid_cancelled_booking.user_id,
    )
    assert response.data.status == BookingStatus.REFUNDED
    assert repository.booking.refund_status == RefundStatus.REFUNDED
