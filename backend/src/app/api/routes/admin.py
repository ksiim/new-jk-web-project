import datetime
import uuid

from fastapi import APIRouter, Depends

from src.app.api.dependencies.common import (
    BookingServiceDep,
    PoeServiceDep,
    ReviewServiceDep,
    TourServiceDep,
    UserServiceDep,
)
from src.app.api.dependencies.pagination import PaginationDep
from src.app.api.dependencies.users import CurrentUser, get_current_admin
from src.app.db.models.booking import BookingsPublic, BookingStatus
from src.app.db.models.guide_application import (
    GuideApplicationDecision,
    GuideApplicationResponse,
    GuideApplicationsPublic,
    GuideApplicationStatus,
)
from src.app.db.models.poe import (
    PoeDetail,
    PoeModerationDecision,
    PoesPublic,
    PoeTaxonomiesPublic,
    PoeTaxonomyCreate,
    PoeTaxonomyPublic,
    PoeTaxonomyUpdate,
    PoeUpdate,
)
from src.app.db.models.review import ReviewModerationDecision, ReviewResponse, ReviewsPublic
from src.app.db.models.tour import TourModerationDecision, TourResponse, ToursPublic, TourStatus
from src.app.db.models.user import (
    Role,
    UserBlockRequest,
    UserModerationResponse,
    UsersPublic,
    UserStatus,
)
from src.app.db.schemas import DetailResponse

router = APIRouter(dependencies=[Depends(get_current_admin)])


@router.get("/users", response_model=UsersPublic)
async def read_admin_users(
    user_service: UserServiceDep,
    pagination: PaginationDep,
    role: Role | None = None,
    status: UserStatus | None = None,
) -> UsersPublic:
    return await user_service.get_users(
        page=pagination.page,
        limit=pagination.limit,
        role=role,
        status=status,
    )


@router.get("/guides", response_model=UsersPublic)
async def read_admin_guides(
    user_service: UserServiceDep,
    pagination: PaginationDep,
    status: UserStatus | None = None,
) -> UsersPublic:
    return await user_service.get_users(
        page=pagination.page,
        limit=pagination.limit,
        role=Role.GUIDE,
        status=status,
    )


@router.post("/users/{user_id}/block", response_model=UserModerationResponse)
async def block_user(
    user_service: UserServiceDep,
    user_id: uuid.UUID,
    payload: UserBlockRequest,
    current_user: CurrentUser,
) -> UserModerationResponse:
    return await user_service.block_user(
        user_id=user_id,
        admin_id=current_user.id,
        reason=payload.reason,
    )


@router.post("/users/{user_id}/unblock", response_model=UserModerationResponse)
async def unblock_user(
    user_service: UserServiceDep,
    user_id: uuid.UUID,
) -> UserModerationResponse:
    return await user_service.unblock_user(user_id=user_id)


@router.get("/guides/applications", response_model=GuideApplicationsPublic)
async def read_guide_applications(
    user_service: UserServiceDep,
    pagination: PaginationDep,
    status: GuideApplicationStatus | None = None,
) -> GuideApplicationsPublic:
    return await user_service.get_guide_applications(
        page=pagination.page,
        limit=pagination.limit,
        status=status,
    )


@router.post(
    "/guides/applications/{application_id}/approve",
    response_model=GuideApplicationResponse,
)
async def approve_guide_application(
    user_service: UserServiceDep,
    application_id: str,
    current_user: CurrentUser,
) -> GuideApplicationResponse:
    return await user_service.approve_guide_application(
        application_id=application_id,
        admin_id=current_user.id,
    )


@router.post(
    "/guides/applications/{application_id}/reject",
    response_model=GuideApplicationResponse,
)
async def reject_guide_application(
    user_service: UserServiceDep,
    application_id: str,
    payload: GuideApplicationDecision,
    current_user: CurrentUser,
) -> GuideApplicationResponse:
    return await user_service.reject_guide_application(
        application_id=application_id,
        admin_id=current_user.id,
        decision_in=payload,
    )


@router.get("/tours", response_model=ToursPublic)
async def read_admin_tours(
    tour_service: TourServiceDep,
    pagination: PaginationDep,
    status: TourStatus | None = None,
) -> ToursPublic:
    return await tour_service.get_admin_tours(
        page=pagination.page,
        limit=pagination.limit,
        status=status,
    )


@router.post("/tours/{tour_id}/approve", response_model=TourResponse)
async def approve_tour(
    tour_service: TourServiceDep,
    tour_id: str,
    payload: TourModerationDecision,
    current_user: CurrentUser,
) -> TourResponse:
    return await tour_service.approve_tour(
        tour_id=tour_id,
        admin_id=current_user.id,
        decision_in=payload,
    )


@router.post("/tours/{tour_id}/hide", response_model=TourResponse)
async def hide_tour(
    tour_service: TourServiceDep,
    tour_id: str,
    payload: TourModerationDecision,
    current_user: CurrentUser,
) -> TourResponse:
    return await tour_service.hide_tour(
        tour_id=tour_id,
        admin_id=current_user.id,
        decision_in=payload,
    )


@router.post("/tours/{tour_id}/reject", response_model=TourResponse)
async def reject_tour(
    tour_service: TourServiceDep,
    tour_id: str,
    payload: TourModerationDecision,
    current_user: CurrentUser,
) -> TourResponse:
    return await tour_service.reject_tour(
        tour_id=tour_id,
        admin_id=current_user.id,
        decision_in=payload,
    )


@router.get("/poes", response_model=PoesPublic)
async def read_admin_poes(
    poe_service: PoeServiceDep,
    pagination: PaginationDep,
    status: str | None = None,
) -> PoesPublic:
    return await poe_service.get_admin_poes(
        page=pagination.page,
        limit=pagination.limit,
        status=status,
    )


@router.patch("/poes/{poe_id}", response_model=DetailResponse[PoeDetail])
async def update_admin_poe(
    poe_service: PoeServiceDep,
    poe_id: str,
    poe_in: PoeUpdate,
) -> DetailResponse[PoeDetail]:
    return await poe_service.update_poe(poe_id, poe_in)


@router.post("/poes/{poe_id}/hide", response_model=DetailResponse[PoeDetail])
async def hide_admin_poe(
    poe_service: PoeServiceDep,
    poe_id: str,
    payload: PoeModerationDecision,
) -> DetailResponse[PoeDetail]:
    return await poe_service.hide_poe(poe_id, payload)


@router.post("/poes/{poe_id}/delete", response_model=DetailResponse[PoeDetail])
async def delete_admin_poe(
    poe_service: PoeServiceDep,
    poe_id: str,
    payload: PoeModerationDecision,
) -> DetailResponse[PoeDetail]:
    return await poe_service.delete_poe(poe_id, payload)


@router.get("/poes/taxonomy", response_model=PoeTaxonomiesPublic)
async def read_taxonomy(
    poe_service: PoeServiceDep,
    pagination: PaginationDep,
    type: str | None = None,
    status: str | None = None,
) -> PoeTaxonomiesPublic:
    return await poe_service.get_taxonomies(
        page=pagination.page,
        limit=pagination.limit,
        type_value=type,
        status=status,
    )


@router.post("/poes/taxonomy", response_model=DetailResponse[PoeTaxonomyPublic], status_code=201)
async def create_taxonomy(
    poe_service: PoeServiceDep,
    payload: PoeTaxonomyCreate,
) -> DetailResponse[PoeTaxonomyPublic]:
    return await poe_service.create_taxonomy(payload)


@router.patch("/poes/taxonomy/{taxonomy_id}", response_model=DetailResponse[PoeTaxonomyPublic])
async def update_taxonomy(
    poe_service: PoeServiceDep,
    taxonomy_id: str,
    payload: PoeTaxonomyUpdate,
) -> DetailResponse[PoeTaxonomyPublic]:
    return await poe_service.update_taxonomy(taxonomy_id, payload)


@router.post(
    "/poes/taxonomy/{taxonomy_id}/archive",
    response_model=DetailResponse[PoeTaxonomyPublic],
)
async def archive_taxonomy(
    poe_service: PoeServiceDep,
    taxonomy_id: str,
) -> DetailResponse[PoeTaxonomyPublic]:
    return await poe_service.archive_taxonomy(taxonomy_id)


@router.get("/reviews", response_model=ReviewsPublic)
async def read_admin_reviews(
    review_service: ReviewServiceDep,
    pagination: PaginationDep,
    suspicious: bool | None = None,
    hidden: bool | None = None,
) -> ReviewsPublic:
    return await review_service.get_admin_reviews(
        page=pagination.page,
        limit=pagination.limit,
        suspicious=suspicious,
        hidden=hidden,
    )


@router.post("/reviews/{review_id}/hide", response_model=ReviewResponse)
async def hide_admin_review(
    review_service: ReviewServiceDep,
    review_id: str,
    payload: ReviewModerationDecision,
) -> ReviewResponse:
    return await review_service.hide_review(review_id, payload)


@router.delete("/reviews/{review_id}", response_model=DetailResponse[dict[str, str]])
async def delete_admin_review(
    review_service: ReviewServiceDep,
    review_id: str,
) -> DetailResponse[dict[str, str]]:
    return await review_service.delete_review(review_id)


@router.get("/bookings", response_model=BookingsPublic)
async def read_admin_bookings(
    booking_service: BookingServiceDep,
    pagination: PaginationDep,
    user_id: uuid.UUID | None = None,
    tour_id: str | None = None,
    status: BookingStatus | None = None,
    date_from: datetime.datetime | None = None,
    date_to: datetime.datetime | None = None,
) -> BookingsPublic:
    return await booking_service.get_admin_bookings(
        page=pagination.page,
        limit=pagination.limit,
        user_id=user_id,
        tour_id=tour_id,
        status=status,
        date_from=date_from,
        date_to=date_to,
    )
