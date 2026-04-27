
from fastapi import HTTPException

from src.app.db.models.booking import BookingStatus
from src.app.db.models.review import (
    PoeReviewCreate,
    Review,
    ReviewCreatedPublic,
    ReviewEntityType,
    ReviewPublic,
    ReviewResponse,
    ReviewsPublic,
    ReviewUserPublic,
    TourReviewCreate,
)
from src.app.db.models.user import User
from src.app.db.schemas import DetailResponse, PaginationMeta
from src.app.repositories.review import ReviewRepository
from src.app.service.base import BaseService


def review_to_public(review: Review) -> ReviewPublic:
    return ReviewPublic(
        id=review.id,
        user=ReviewUserPublic(id=review.user_id, name=review.user_name),
        rating=review.rating,
        text=review.text,
        created_at=review.created_at,
    )


def review_to_created(review: Review) -> ReviewCreatedPublic:
    return ReviewCreatedPublic(
        id=review.id,
        rating=review.rating,
        text=review.text,
        accessibility_rating=review.accessibility_rating,
        created_at=review.created_at,
    )


class ReviewService(BaseService[ReviewRepository]):
    async def get_tour_reviews(
        self,
        *,
        tour_id: str,
        page: int,
        limit: int,
        rating: int | None = None,
    ) -> ReviewsPublic:
        tour = await self.repository.get_tour(tour_id)
        if not tour:
            raise HTTPException(status_code=404, detail="Tour not found")
        reviews, total = await self.repository.list_reviews(
            entity_type=ReviewEntityType.TOUR,
            entity_id=tour_id,
            skip=(page - 1) * limit,
            limit=limit,
            rating=rating,
        )
        return ReviewsPublic(
            data=[review_to_public(review) for review in reviews],
            meta=PaginationMeta.create(page=page, limit=limit, total=total),
        )

    async def create_tour_review(
        self,
        *,
        tour_id: str,
        review_in: TourReviewCreate,
        current_user: User,
    ) -> ReviewResponse:
        tour = await self.repository.get_tour(tour_id)
        if not tour:
            raise HTTPException(status_code=404, detail="Tour not found")
        booking = await self.repository.get_booking(review_in.booking_id)
        if not booking or booking.tour_id != tour_id:
            raise HTTPException(status_code=404, detail="Booking not found")
        if booking.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to review this booking")
        if booking.status not in {
            BookingStatus.CONFIRMED,
            BookingStatus.COMPLETED,
            BookingStatus.REFUNDED,
        }:
            raise HTTPException(status_code=409, detail="Booking is not eligible for review")
        existing_review = await self.repository.get_user_tour_review(
            booking_id=review_in.booking_id,
            user_id=current_user.id,
        )
        if existing_review:
            raise HTTPException(status_code=409, detail="Review for this booking already exists")

        review = Review(
            entity_type=ReviewEntityType.TOUR,
            entity_id=tour_id,
            user_id=current_user.id,
            user_name=current_user.name,
            booking_id=review_in.booking_id,
            rating=review_in.rating,
            text=review_in.text,
            accessibility_rating=review_in.accessibility_rating,
        )
        review_public = review_to_created(review)
        await self.repository.add_and_recalculate(
            review=review,
            entity_type=ReviewEntityType.TOUR,
            entity_id=tour_id,
        )
        return DetailResponse(data=review_public)

    async def create_poe_review(
        self,
        *,
        poe_id: str,
        review_in: PoeReviewCreate,
        current_user: User,
    ) -> ReviewResponse:
        poe = await self.repository.get_poe(poe_id)
        if not poe:
            raise HTTPException(status_code=404, detail="POE not found")
        review = Review(
            entity_type=ReviewEntityType.POE,
            entity_id=poe_id,
            user_id=current_user.id,
            user_name=current_user.name,
            rating=review_in.rating,
            text=review_in.text,
            accessibility_rating=review_in.accessibility_rating,
        )
        review_public = review_to_created(review)
        await self.repository.add_and_recalculate(
            review=review,
            entity_type=ReviewEntityType.POE,
            entity_id=poe_id,
        )
        return DetailResponse(data=review_public)
