from __future__ import annotations

import datetime

import pytest
from fastapi import HTTPException

from src.app.db.models.tour import SlotStatus, TourSlot, TourSlotCreate
from src.app.service.tour import (
    TourService,
    normalize_datetime,
    slot_to_price,
    slot_to_public,
    tour_to_accessibility,
    tour_to_detail,
    tour_to_guide,
    tour_to_guide_detail,
    tour_to_price,
    tour_to_public,
)


class FakeTourRepository:
    def __init__(self, tour) -> None:
        self.tour = tour
        self.slots: list[TourSlot] = []
        self.tour_rating_stats_map: dict[str, tuple[float, int]] = {}
        self.guide_rating_stats_map: dict[str, tuple[float, int]] = {}

    async def get_by_id(self, entity_id: str):
        if self.tour is None:
            return None
        return self.tour if entity_id == self.tour.id else None

    async def add(self, entity):
        return entity

    async def add_slot(self, slot):
        self.slots.append(slot)
        return slot

    async def list_tours(self, **kwargs):
        return [self.tour], 1

    async def list_slots(self, **kwargs):
        return self.slots

    async def get_tour_rating_stats_map(self, *, tour_ids):
        return {
            tour_id: self.tour_rating_stats_map[tour_id]
            for tour_id in tour_ids
            if tour_id in self.tour_rating_stats_map
        }

    async def get_guide_rating_stats_map(self, *, guide_ids):
        return {
            guide_id: self.guide_rating_stats_map[guide_id]
            for guide_id in guide_ids
            if guide_id in self.guide_rating_stats_map
        }


def test_normalize_datetime_drops_timezone_to_naive_utc():
    aware = datetime.datetime(2026, 4, 27, 10, tzinfo=datetime.UTC)
    normalized = normalize_datetime(aware)
    assert normalized == datetime.datetime(2026, 4, 27, 10)
    assert normalized.tzinfo is None


def test_normalize_datetime_keeps_naive():
    naive = datetime.datetime(2026, 4, 27, 10)
    assert normalize_datetime(naive) is naive


def test_tour_mapping_helpers(sample_tour):
    assert tour_to_guide(sample_tour).name == sample_tour.guide_name
    detail = tour_to_guide_detail(sample_tour)
    assert detail.bio == sample_tour.guide_bio
    assert tour_to_price(sample_tour).amount == sample_tour.price_amount
    assert tour_to_accessibility(sample_tour).wheelchair_accessible is False
    public = tour_to_public(sample_tour)
    assert public.short_description == sample_tour.description
    detailed = tour_to_detail(sample_tour)
    assert detailed.guide.avatar_url == sample_tour.guide_avatar_url
    assert detailed.rating == sample_tour.rating


def test_slot_mapping_helpers(sample_slot):
    price = slot_to_price(sample_slot)
    assert price.amount == sample_slot.price_amount
    public = slot_to_public(sample_slot)
    assert public.status == SlotStatus.AVAILABLE


def test_slot_to_public_normalizes_zero_capacity_available(sample_slot):
    sample_slot.available_capacity = 0
    sample_slot.status = SlotStatus.AVAILABLE
    assert slot_to_public(sample_slot).status == SlotStatus.SOLD_OUT


@pytest.mark.asyncio
async def test_create_tour_returns_detail_response(sample_tour):
    repository = FakeTourRepository(sample_tour)
    service = TourService(repository)
    response = await service.create_tour(sample_tour)
    assert response.data.id == sample_tour.id


@pytest.mark.asyncio
async def test_get_tours_returns_paginated_list(sample_tour):
    repository = FakeTourRepository(sample_tour)
    service = TourService(repository)
    response = await service.get_tours(page=1, limit=20)
    assert response.meta.total == 1
    assert response.data[0].id == sample_tour.id


@pytest.mark.asyncio
async def test_get_tours_uses_runtime_rating_stats(sample_tour):
    sample_tour.rating = 1.0
    sample_tour.reviews_count = 1
    sample_tour.guide_rating = 1.0
    sample_tour.guide_reviews_count = 1
    repository = FakeTourRepository(sample_tour)
    repository.tour_rating_stats_map = {sample_tour.id: (4.6, 12)}
    repository.guide_rating_stats_map = {sample_tour.guide_id: (4.8, 30)}

    response = await TourService(repository).get_tours(page=1, limit=20)

    assert response.data[0].rating == pytest.approx(4.6)
    assert response.data[0].reviews_count == 12
    assert response.data[0].guide.rating == pytest.approx(4.8)
    assert response.data[0].guide.reviews_count == 30


@pytest.mark.asyncio
async def test_get_tour_returns_detail(sample_tour):
    repository = FakeTourRepository(sample_tour)
    service = TourService(repository)
    response = await service.get_tour(sample_tour.id)
    assert response.data.id == sample_tour.id


@pytest.mark.asyncio
async def test_get_tour_uses_runtime_group_rating(sample_tour):
    sample_tour.guide_rating = 1.0
    sample_tour.guide_reviews_count = 1
    repository = FakeTourRepository(sample_tour)
    repository.tour_rating_stats_map = {sample_tour.id: (4.4, 8)}
    repository.guide_rating_stats_map = {sample_tour.guide_id: (4.9, 24)}

    response = await TourService(repository).get_tour(sample_tour.id)

    assert response.data.rating == pytest.approx(4.4)
    assert response.data.reviews_count == 8
    assert response.data.guide.rating == pytest.approx(4.9)
    assert response.data.guide.reviews_count == 24


@pytest.mark.asyncio
async def test_get_tour_falls_back_to_zero_ratings_when_no_reviews(sample_tour):
    sample_tour.rating = 3.5
    sample_tour.reviews_count = 7
    sample_tour.guide_rating = 4.0
    sample_tour.guide_reviews_count = 11
    repository = FakeTourRepository(sample_tour)

    response = await TourService(repository).get_tour(sample_tour.id)

    assert response.data.rating == 0.0
    assert response.data.reviews_count == 0
    assert response.data.guide.rating == 0.0
    assert response.data.guide.reviews_count == 0


@pytest.mark.asyncio
async def test_get_tour_raises_for_missing():
    repository = FakeTourRepository(None)
    service = TourService(repository)
    with pytest.raises(HTTPException) as exc:
        await service.get_tour("missing")
    assert exc.value.status_code == 404


@pytest.mark.asyncio
async def test_create_slot_normalizes_aware_datetime_and_marks_zero_capacity_sold_out(sample_tour):
    repository = FakeTourRepository(sample_tour)
    service = TourService(repository)

    response = await service.create_slot(
        tour_id=sample_tour.id,
        slot_in=TourSlotCreate(
            starts_at=datetime.datetime(2026, 4, 27, 10, tzinfo=datetime.UTC),
            ends_at=datetime.datetime(2026, 4, 27, 11, tzinfo=datetime.UTC),
            available_capacity=0,
            price={"amount": 100, "currency": "RUB"},
            status=SlotStatus.AVAILABLE,
        ),
    )

    assert response.data.status == SlotStatus.SOLD_OUT
    assert response.data.starts_at.tzinfo is None


@pytest.mark.asyncio
async def test_create_slot_rejects_missing_tour(sample_tour):
    repository = FakeTourRepository(sample_tour)
    service = TourService(repository)
    with pytest.raises(HTTPException) as exc:
        await service.create_slot(
            tour_id="missing",
            slot_in=TourSlotCreate(
                starts_at=datetime.datetime(2026, 4, 27, 10),
                ends_at=datetime.datetime(2026, 4, 27, 11),
                available_capacity=2,
                price={"amount": 100, "currency": "RUB"},
                status=SlotStatus.AVAILABLE,
            ),
        )
    assert exc.value.status_code == 404


@pytest.mark.asyncio
async def test_create_slot_rejects_invalid_time_range(sample_tour):
    repository = FakeTourRepository(sample_tour)
    service = TourService(repository)
    with pytest.raises(HTTPException) as exc:
        await service.create_slot(
            tour_id=sample_tour.id,
            slot_in=TourSlotCreate(
                starts_at=datetime.datetime(2026, 4, 27, 11),
                ends_at=datetime.datetime(2026, 4, 27, 10),
                available_capacity=2,
                price={"amount": 100, "currency": "RUB"},
                status=SlotStatus.AVAILABLE,
            ),
        )
    assert exc.value.status_code == 422


@pytest.mark.asyncio
async def test_create_slot_rejects_capacity_above_group_limit(sample_tour):
    repository = FakeTourRepository(sample_tour)
    service = TourService(repository)
    with pytest.raises(HTTPException) as exc:
        await service.create_slot(
            tour_id=sample_tour.id,
            slot_in=TourSlotCreate(
                starts_at=datetime.datetime(2026, 4, 27, 10),
                ends_at=datetime.datetime(2026, 4, 27, 11),
                available_capacity=20,
                price={"amount": 100, "currency": "RUB"},
                status=SlotStatus.AVAILABLE,
            ),
        )
    assert exc.value.status_code == 422


@pytest.mark.asyncio
async def test_create_slot_rejects_sold_out_with_positive_capacity(sample_tour):
    repository = FakeTourRepository(sample_tour)
    service = TourService(repository)
    with pytest.raises(HTTPException) as exc:
        await service.create_slot(
            tour_id=sample_tour.id,
            slot_in=TourSlotCreate(
                starts_at=datetime.datetime(2026, 4, 27, 10),
                ends_at=datetime.datetime(2026, 4, 27, 11),
                available_capacity=2,
                price={"amount": 100, "currency": "RUB"},
                status=SlotStatus.SOLD_OUT,
            ),
        )
    assert exc.value.status_code == 422


@pytest.mark.asyncio
async def test_get_slots_returns_normalized_slots(sample_tour, sample_slot):
    sample_slot.available_capacity = 0
    sample_slot.status = SlotStatus.AVAILABLE
    repository = FakeTourRepository(sample_tour)
    repository.slots = [sample_slot]
    response = await TourService(repository).get_slots(tour_id=sample_tour.id)
    assert response.data[0].status == SlotStatus.SOLD_OUT


@pytest.mark.asyncio
async def test_get_slots_raises_for_missing_tour(sample_tour):
    repository = FakeTourRepository(sample_tour)
    service = TourService(repository)
    with pytest.raises(HTTPException) as exc:
        await service.get_slots(tour_id="missing")
    assert exc.value.status_code == 404
