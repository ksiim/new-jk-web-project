from __future__ import annotations

import uuid
from types import SimpleNamespace

import pytest
from fastapi import HTTPException

from src.app.db.models.booking import BookingStatus
from src.app.db.models.review import (
    PoeReviewCreate,
    Review,
    ReviewEntityType,
    ReviewModerationDecision,
    TourReviewCreate,
)
from src.app.service.review import ReviewService, review_to_created, review_to_public


class FakeReviewRepository:
    def __init__(self, tour=None, poe=None, booking=None, reviews=None):
        self.tour = tour
        self.poe = poe
        self.booking = booking
        self.reviews = reviews or []
        self.review = self.reviews[0] if self.reviews else None

    async def get_tour(self, tour_id: str):
        return self.tour if self.tour and self.tour.id == tour_id else None

    async def get_poe(self, poe_id: str):
        return self.poe if self.poe and self.poe.id == poe_id else None

    async def get_booking(self, booking_id: str):
        return self.booking if self.booking and self.booking.id == booking_id else None

    async def get_user_tour_review(self, booking_id: str, user_id: uuid.UUID):
        for review in self.reviews:
            if review.booking_id == booking_id and review.user_id == user_id:
                return review
        return None

    async def get_user_review(self, review_id: str, user_id: uuid.UUID):
        for review in self.reviews:
            if review.id == review_id and review.user_id == user_id:
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

    async def list_user_reviews(self, user_id, skip, limit, entity_type=None):
        filtered = [review for review in self.reviews if review.user_id == user_id]
        if entity_type is not None:
            filtered = [review for review in filtered if review.entity_type == entity_type]
        return filtered[skip : skip + limit], len(filtered)

    async def add_and_recalculate(self, review, entity_type, entity_id):
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

    async def list_admin_reviews(self, skip, limit, suspicious=None, hidden=None):
        items = list(self.reviews)
        if suspicious is not None:
            items = [item for item in items if item.suspicious == suspicious]
        if hidden is not None:
            items = [item for item in items if item.hidden == hidden]
        return items[skip : skip + limit], len(items)

    async def list_guide_reviews(self, guide_id, skip, limit, rating=None):
        if not self.tour:
            return [], 0
        items = [
            item
            for item in self.reviews
            if item.entity_type == ReviewEntityType.TOUR and item.entity_id == self.tour.id
        ]
        if guide_id != self.tour.guide_id:
            items = []
        if rating is not None:
            items = [item for item in items if item.rating == rating]
        return items[skip : skip + limit], len(items)

    async def get_by_id(self, review_id):
        if self.review and self.review.id == review_id:
            return self.review
        for item in self.reviews:
            if item.id == review_id:
                return item
        return None

    async def add(self, entity):
        self.review = entity
        if not any(item.id == entity.id for item in self.reviews):
            self.reviews.append(entity)
        return entity

    async def delete(self, entity):
        self.reviews = [item for item in self.reviews if item.id != entity.id]
        if self.review and self.review.id == entity.id:
            self.review = None
        return True


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
async def test_get_my_reviews_returns_paginated_data(sample_review, sample_user):
    repository = FakeReviewRepository(reviews=[sample_review])

    response = await ReviewService(repository).get_my_reviews(
        user_id=sample_user.id,
        page=1,
        limit=20,
    )

    assert response.meta.total == 1
    assert response.data[0].id == sample_review.id


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
        async def add_and_recalculate(self, review, entity_type, entity_id):
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
        async def add_and_recalculate(self, review, entity_type, entity_id):
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


@pytest.mark.asyncio
async def test_get_admin_reviews_returns_paginated_data(sample_review):
    repository = FakeReviewRepository(reviews=[sample_review])
    response = await ReviewService(repository).get_admin_reviews(page=1, limit=20)
    assert response.meta.total == 1
    assert response.data[0].id == sample_review.id


@pytest.mark.asyncio
async def test_get_guide_reviews_returns_filtered_data(sample_tour, sample_review):
    sample_review.entity_type = ReviewEntityType.TOUR
    sample_review.entity_id = sample_tour.id
    second = Review.model_validate(
        {
            **sample_review.model_dump(),
            "id": "review_2",
            "rating": 3,
        },
    )
    repository = FakeReviewRepository(tour=sample_tour, reviews=[sample_review, second])
    response = await ReviewService(repository).get_guide_reviews(
        guide_id=sample_tour.guide_id,
        page=1,
        limit=20,
        rating=3,
    )
    assert response.meta.total == 1
    assert response.data[0].id == "review_2"


@pytest.mark.asyncio
async def test_hide_review_sets_flags(sample_review):
    repository = FakeReviewRepository(reviews=[sample_review])
    response = await ReviewService(repository).hide_review(
        sample_review.id,
        ReviewModerationDecision(suspicious=True, reported_count=2),
    )
    assert response.data.id == sample_review.id
    assert repository.review.hidden is True
    assert repository.review.suspicious is True
    assert repository.review.reported_count == 2


@pytest.mark.asyncio
async def test_delete_review_removes_entity(sample_review):
    repository = FakeReviewRepository(reviews=[sample_review])
    response = await ReviewService(repository).delete_review(sample_review.id)
    assert response.data["status"] == "deleted"


@pytest.mark.asyncio
async def test_delete_my_review_removes_owned_entity(sample_review, sample_user):
    repository = FakeReviewRepository(reviews=[sample_review])
    response = await ReviewService(repository).delete_my_review(sample_review.id, sample_user.id)
    assert response.data["status"] == "deleted"


@pytest.mark.asyncio
async def test_delete_my_review_raises_for_foreign_user(sample_review):
    repository = FakeReviewRepository(reviews=[sample_review])
    with pytest.raises(HTTPException) as exc:
        await ReviewService(repository).delete_my_review(sample_review.id, uuid.uuid4())
    assert exc.value.status_code == 404
