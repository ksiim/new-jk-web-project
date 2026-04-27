from fastapi import APIRouter

from src.app.api.dependencies.common import ReviewServiceDep
from src.app.api.dependencies.pagination import PaginationDep
from src.app.api.dependencies.users import CurrentUser
from src.app.db.models.review import (
    PoeReviewCreate,
    ReviewResponse,
    ReviewsPublic,
    TourReviewCreate,
)

router = APIRouter()


@router.get("/tours/{tour_id}/reviews", response_model=ReviewsPublic)
async def read_tour_reviews(
    review_service: ReviewServiceDep,
    pagination: PaginationDep,
    tour_id: str,
    rating: int | None = None,
) -> ReviewsPublic:
    return await review_service.get_tour_reviews(
        tour_id=tour_id,
        page=pagination.page,
        limit=pagination.limit,
        rating=rating,
    )


@router.post("/tours/{tour_id}/reviews", response_model=ReviewResponse, status_code=201)
async def create_tour_review(
    review_service: ReviewServiceDep,
    current_user: CurrentUser,
    tour_id: str,
    review_in: TourReviewCreate,
) -> ReviewResponse:
    return await review_service.create_tour_review(
        tour_id=tour_id,
        review_in=review_in,
        current_user=current_user,
    )


@router.post("/poes/{poe_id}/reviews", response_model=ReviewResponse, status_code=201)
async def create_poe_review(
    review_service: ReviewServiceDep,
    current_user: CurrentUser,
    poe_id: str,
    review_in: PoeReviewCreate,
) -> ReviewResponse:
    return await review_service.create_poe_review(
        poe_id=poe_id,
        review_in=review_in,
        current_user=current_user,
    )
