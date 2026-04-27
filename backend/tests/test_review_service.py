from __future__ import annotations

import uuid
from types import SimpleNamespace

import pytest
from fastapi import HTTPException

from src.app.db.models.booking import BookingStatus
from src.app.db.models.review import PoeReviewCreate, Review, ReviewEntityType, TourReviewCreate
from src.app.service.review import ReviewService, review_to_created, review_to_public


class FakeReviewRepository:
    def __init__(self, *, tour=None, poe=None, booking=None, reviews=None):
        self.tour = tour
        self.poe = poe
        self.booking = booking
        self.reviews = reviews or []

    async def get_tour(self, tour_id: str):
        return self.tour if self.tour and self.tour.id == tour_id else None

    async def get_poe(self, poe_id: str):
        return self.poe if self.poe and self.poe.id == poe_id else None

    async def get_booking(self, booking_id: str):
        return self.booking if self.booking and self.booking.id == booking_id else None

    async def get_user_tour_review(self, *, booking_id: str, user_id: uuid.UUID):
        for review in self.reviews:
            if review.booking_id == booking_id and review.user_id == user_id:
                return review
        return None

    async def list_reviews(self, **kwargs):
        entity_type = kwargs["entity_type"]
        entity_id = kwargs["entity_id"]
        rating = kwargs.get("rating")
        filtered = [
            review
            for review in self.reviews
            if review.entity_type == entity_type and review.entity_id == entity_id
        ]
        if rating is not None:
            filtered = [review for review in filtered if review.rating == rating]
        return filtered, len(filtered)

    async def add_and_recalculate(self, *, review, entity_type, entity_id):
        self.reviews.append(review)
        if entity_type == ReviewEntityType.TOUR and self.tour:
            current = [
                item
                for item in self.reviews
                if item.entity_type == entity_type and item.entity_id == entity_id
            ]
            self.tour.rating = sum(item.rating for item in current) / len(current)
            self.tour.reviews_count = len(current)
            self.tour.guide_rating = self.tour.rating
            self.tour.guide_reviews_count = self.tour.reviews_count
        if entity_type == ReviewEntityType.POE and self.poe:
            current = [
                item
                for item in self.reviews
                if item.entity_type == entity_type and item.entity_id == entity_id
            ]
            self.poe.rating = sum(item.rating for item in current) / len(current)
            self.poe.reviews_count = len(current)
        return review


class ExplodingReturnedReview:
    def __getattr__(self, name):
        raise AssertionError(f"service should not read returned review attribute: {name}")


def test_review_to_public(sample_review):
    result = review_to_public(sample_review)
    assert result.id == sample_review.id
    assert result.user.name == sample_review.user_name
    assert result.rating == sample_review.rating


def test_review_to_created(sample_review):
    sample_review.accessibility_rating = 4
    result = review_to_created(sample_review)
    assert result.id == sample_review.id
    assert result.accessibility_rating == 4


@pytest.mark.asyncio
async def test_get_tour_reviews_returns_paginated_data(sample_tour, sample_review):
    second_review = Review.model_validate(
        {
            **sample_review.model_dump(),
            "id": "review_2",
            "rating": 4,
            "entity_type": ReviewEntityType.TOUR,
            "entity_id": sample_tour.id,
        },
    )
    sample_review.entity_type = ReviewEntityType.TOUR
    sample_review.entity_id = sample_tour.id
    repository = FakeReviewRepository(tour=sample_tour, reviews=[sample_review, second_review])

    response = await ReviewService(repository).get_tour_reviews(
        tour_id=sample_tour.id,
        page=1,
        limit=20,
        rating=4,
    )

    assert response.meta.total == 1
    assert response.data[0].id == "review_2"


@pytest.mark.asyncio
async def test_get_tour_reviews_raises_for_missing_tour():
    repository = FakeReviewRepository()
    with pytest.raises(HTTPException) as exc:
        await ReviewService(repository).get_tour_reviews(tour_id="missing", page=1, limit=20)
    assert exc.value.status_code == 404


@pytest.mark.asyncio
async def test_create_tour_review_updates_tour_and_guide_ratings(
    sample_tour,
    sample_booking,
    sample_user,
):
    sample_booking.status = BookingStatus.CONFIRMED
    repository = FakeReviewRepository(tour=sample_tour, booking=sample_booking)
    service = ReviewService(repository)
    current_user = SimpleNamespace(id=sample_user.id, name=sample_user.name)

    response = await service.create_tour_review(
        tour_id=sample_tour.id,
        review_in=TourReviewCreate(
            booking_id=sample_booking.id,
            rating=5,
            text="Great tour",
            accessibility_rating=4,
        ),
        current_user=current_user,
    )

    assert response.data.rating == 5
    assert repository.tour.rating == 5
    assert repository.tour.reviews_count == 1
    assert repository.tour.guide_rating == 5
    assert repository.tour.guide_reviews_count == 1


@pytest.mark.asyncio
async def test_create_tour_review_does_not_depend_on_post_commit_review_state(
    sample_tour,
    sample_booking,
    sample_user,
):
    sample_booking.status = BookingStatus.CONFIRMED

    class PostCommitLikeRepository(FakeReviewRepository):
        async def add_and_recalculate(self, *, review, entity_type, entity_id):
            await super().add_and_recalculate(
                review=review,
                entity_type=entity_type,
                entity_id=entity_id,
            )
            return ExplodingReturnedReview()

    repository = PostCommitLikeRepository(tour=sample_tour, booking=sample_booking)
    service = ReviewService(repository)

    response = await service.create_tour_review(
        tour_id=sample_tour.id,
        review_in=TourReviewCreate(
            booking_id=sample_booking.id,
            rating=5,
            text="Great tour",
            accessibility_rating=4,
        ),
        current_user=SimpleNamespace(id=sample_user.id, name=sample_user.name),
    )

    assert response.data.id.startswith("review_")
    assert response.data.rating == 5


@pytest.mark.asyncio
async def test_create_tour_review_rejects_missing_tour(sample_booking, sample_user):
    repository = FakeReviewRepository(booking=sample_booking)
    with pytest.raises(HTTPException) as exc:
        await ReviewService(repository).create_tour_review(
            tour_id="missing",
            review_in=TourReviewCreate(
                booking_id=sample_booking.id,
                rating=5,
                text="Great tour",
                accessibility_rating=4,
            ),
            current_user=SimpleNamespace(id=sample_user.id, name=sample_user.name),
        )
    assert exc.value.status_code == 404


@pytest.mark.asyncio
async def test_create_tour_review_rejects_missing_booking(sample_tour, sample_user):
    repository = FakeReviewRepository(tour=sample_tour)
    with pytest.raises(HTTPException) as exc:
        await ReviewService(repository).create_tour_review(
            tour_id=sample_tour.id,
            review_in=TourReviewCreate(
                booking_id="missing",
                rating=5,
                text="Great tour",
                accessibility_rating=4,
            ),
            current_user=SimpleNamespace(id=sample_user.id, name=sample_user.name),
        )
    assert exc.value.status_code == 404


@pytest.mark.asyncio
async def test_create_tour_review_rejects_foreign_booking(sample_tour, sample_booking, sample_user):
    other_user = SimpleNamespace(id=uuid.uuid4(), name="Bob")
    repository = FakeReviewRepository(tour=sample_tour, booking=sample_booking)
    with pytest.raises(HTTPException) as exc:
        await ReviewService(repository).create_tour_review(
            tour_id=sample_tour.id,
            review_in=TourReviewCreate(
                booking_id=sample_booking.id,
                rating=5,
                text="Great tour",
                accessibility_rating=4,
            ),
            current_user=other_user,
        )
    assert exc.value.status_code == 403


@pytest.mark.asyncio
async def test_create_tour_review_rejects_ineligible_booking_status(
    sample_tour,
    sample_booking,
    sample_user,
):
    sample_booking.status = BookingStatus.CANCELLED
    repository = FakeReviewRepository(tour=sample_tour, booking=sample_booking)
    with pytest.raises(HTTPException) as exc:
        await ReviewService(repository).create_tour_review(
            tour_id=sample_tour.id,
            review_in=TourReviewCreate(
                booking_id=sample_booking.id,
                rating=5,
                text="Great tour",
                accessibility_rating=4,
            ),
            current_user=SimpleNamespace(id=sample_user.id, name=sample_user.name),
        )
    assert exc.value.status_code == 409


@pytest.mark.asyncio
async def test_create_tour_review_rejects_duplicate_booking_review(
    sample_tour,
    sample_booking,
    sample_user,
):
    sample_booking.status = BookingStatus.CONFIRMED
    repository = FakeReviewRepository(tour=sample_tour, booking=sample_booking)
    service = ReviewService(repository)
    current_user = SimpleNamespace(id=sample_user.id, name=sample_user.name)

    await service.create_tour_review(
        tour_id=sample_tour.id,
        review_in=TourReviewCreate(
            booking_id=sample_booking.id,
            rating=5,
            text="Great tour",
            accessibility_rating=4,
        ),
        current_user=current_user,
    )

    with pytest.raises(HTTPException) as exc:
        await service.create_tour_review(
            tour_id=sample_tour.id,
            review_in=TourReviewCreate(
                booking_id=sample_booking.id,
                rating=4,
                text="Second try",
                accessibility_rating=3,
            ),
            current_user=current_user,
        )
    assert exc.value.status_code == 409


@pytest.mark.asyncio
async def test_create_poe_review_updates_rating(sample_poe, sample_user):
    repository = FakeReviewRepository(poe=sample_poe)
    response = await ReviewService(repository).create_poe_review(
        poe_id=sample_poe.id,
        review_in=PoeReviewCreate(rating=4, text="Nice", accessibility_rating=5),
        current_user=SimpleNamespace(id=sample_user.id, name=sample_user.name),
    )

    assert response.data.rating == 4
    assert sample_poe.rating == 4
    assert sample_poe.reviews_count == 1


@pytest.mark.asyncio
async def test_create_poe_review_does_not_depend_on_post_commit_review_state(
    sample_poe,
    sample_user,
):
    class PostCommitLikeRepository(FakeReviewRepository):
        async def add_and_recalculate(self, *, review, entity_type, entity_id):
            await super().add_and_recalculate(
                review=review,
                entity_type=entity_type,
                entity_id=entity_id,
            )
            return ExplodingReturnedReview()

    repository = PostCommitLikeRepository(poe=sample_poe)
    response = await ReviewService(repository).create_poe_review(
        poe_id=sample_poe.id,
        review_in=PoeReviewCreate(rating=4, text="Nice", accessibility_rating=5),
        current_user=SimpleNamespace(id=sample_user.id, name=sample_user.name),
    )

    assert response.data.id.startswith("review_")
    assert response.data.rating == 4


@pytest.mark.asyncio
async def test_create_poe_review_raises_for_missing_poe(sample_user):
    repository = FakeReviewRepository()
    with pytest.raises(HTTPException) as exc:
        await ReviewService(repository).create_poe_review(
            poe_id="missing",
            review_in=PoeReviewCreate(rating=4, text="Nice", accessibility_rating=5),
            current_user=SimpleNamespace(id=sample_user.id, name=sample_user.name),
        )
    assert exc.value.status_code == 404
