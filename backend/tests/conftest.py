from __future__ import annotations

import datetime
import os
import uuid
from types import SimpleNamespace

import pytest

# Keep service imports self-contained for pytest without depending on a local .env.
os.environ.setdefault("PROJECT_NAME", "test-project")
os.environ.setdefault("PROJECT_FRONTEND_HOST", "http://localhost:3000")
os.environ.setdefault("PROJECT_API_V1_STR", "/api/v1")
os.environ.setdefault("PROJECT_SECRET_KEY", "test-secret")
os.environ.setdefault("PROJECT_ACCESS_TOKEN_EXPIRE_MINUTES", "30")

from src.app.db.models.booking import Booking, BookingStatus, RefundStatus
from src.app.db.models.poe import Poe
from src.app.db.models.review import Review
from src.app.db.models.route import Pace
from src.app.db.models.tour import SlotStatus, Tour, TourFormat, TourSlot


@pytest.fixture
def sample_user() -> SimpleNamespace:
    return SimpleNamespace(id=uuid.uuid4(), name="Alice")


@pytest.fixture
def sample_tour() -> Tour:
    return Tour(
        id="tour_1",
        title="Tour",
        description="Desc",
        city_id="city_spb",
        guide_id="guide_1",
        guide_name="Guide",
        guide_avatar_url="https://example.com/guide.jpg",
        guide_bio="Guide bio",
        format=TourFormat.OFFLINE_GUIDED,
        duration_minutes=120,
        price_amount=1000,
        meeting_lat=59.93,
        meeting_lng=30.31,
        meeting_address="Nevsky, 1",
        group_size_max=10,
        route_distance_meters=3500,
        route_points_count=6,
    )


@pytest.fixture
def sample_slot() -> TourSlot:
    return TourSlot(
        id="slot_1",
        tour_id="tour_1",
        starts_at=datetime.datetime(2026, 5, 1, 10, 0),
        ends_at=datetime.datetime(2026, 5, 1, 12, 0),
        available_capacity=3,
        price_amount=1000,
        status=SlotStatus.AVAILABLE,
    )


@pytest.fixture
def sample_booking(sample_user: SimpleNamespace) -> Booking:
    return Booking(
        id="booking_1",
        tour_id="tour_1",
        slot_id="slot_1",
        user_id=sample_user.id,
        participants_count=1,
        status=BookingStatus.PENDING_PAYMENT,
        price_total_amount=1000,
        price_total_currency="RUB",
        payment_id="pay_1",
        payment_url="/pay",
        created_at=datetime.datetime(2026, 5, 1, 9, 0),
    )


@pytest.fixture
def sample_poe() -> Poe:
    return Poe(
        id="poe_1",
        city_id="city_spb",
        title="Coffee",
        description="Desc",
        category="coffee",
        tags=["coffee", "cozy"],
        lat=59.94,
        lng=30.31,
        address="Nevsky, 2",
        wheelchair_accessible=True,
        has_ramp=True,
        has_stairs=False,
        duration_minutes=30,
        opening_hours=[{"day": "mon", "from": "08:00", "to": "22:00"}],
    )


@pytest.fixture
def route_poes() -> list[Poe]:
    return [
        Poe(
            id="poe_1",
            city_id="city_spb",
            title="Coffee",
            description="Desc",
            category="coffee",
            tags=["coffee"],
            lat=59.94,
            lng=30.31,
            wheelchair_accessible=True,
            has_ramp=True,
            has_stairs=False,
            duration_minutes=30,
        ),
        Poe(
            id="poe_2",
            city_id="city_spb",
            title="Art",
            description="Desc",
            category="art",
            tags=["art"],
            lat=59.95,
            lng=30.32,
            wheelchair_accessible=True,
            has_ramp=False,
            has_stairs=False,
            duration_minutes=45,
        ),
        Poe(
            id="poe_3",
            city_id="city_spb",
            title="History",
            description="Desc",
            category="history",
            tags=["history"],
            lat=59.99,
            lng=30.39,
            wheelchair_accessible=False,
            has_ramp=False,
            has_stairs=True,
            duration_minutes=60,
        ),
    ]


@pytest.fixture
def sample_review(sample_user: SimpleNamespace) -> Review:
    return Review(
        id="review_1",
        entity_type="tour",
        entity_id="tour_1",
        user_id=sample_user.id,
        user_name=sample_user.name,
        rating=5,
        text="Great",
        created_at=datetime.datetime(2026, 5, 1, 15, 0),
    )


@pytest.fixture
def paid_cancelled_booking(sample_booking: Booking) -> Booking:
    sample_booking.status = BookingStatus.CANCELLED
    sample_booking.refund_status = RefundStatus.PENDING
    return sample_booking


@pytest.fixture
def route_request_factory():
    from src.app.db.models.route import RouteGenerateRequest

    def factory(**overrides):
        payload = {
            "city_id": "city_spb",
            "interests": ["coffee", "art"],
            "start_location": {"lat": 59.9386, "lng": 30.3141},
            "duration_minutes": 180,
            "pace": Pace.MEDIUM,
            "budget_level": "medium",
            "accessibility": {
                "wheelchair_required": False,
                "avoid_stairs": False,
                "need_rest_points": False,
            },
        }
        payload.update(overrides)
        return RouteGenerateRequest.model_validate(payload)

    return factory
