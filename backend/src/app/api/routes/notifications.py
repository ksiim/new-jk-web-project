from fastapi import APIRouter

from src.app.api.dependencies.common import NotificationServiceDep
from src.app.api.dependencies.pagination import PaginationDep
from src.app.api.dependencies.users import CurrentUser
from src.app.db.models.notification import NotificationResponse, NotificationsPublic

router = APIRouter()


@router.get("", response_model=NotificationsPublic)
@router.get("/", response_model=NotificationsPublic, include_in_schema=False)
async def read_notifications(
    notification_service: NotificationServiceDep,
    current_user: CurrentUser,
    pagination: PaginationDep,
) -> NotificationsPublic:
    return await notification_service.get_notifications(
        user_id=current_user.id,
        page=pagination.page,
        limit=pagination.limit,
    )


@router.post("/{notification_id}/read", response_model=NotificationResponse)
async def mark_notification_as_read(
    notification_service: NotificationServiceDep,
    current_user: CurrentUser,
    notification_id: str,
) -> NotificationResponse:
    return await notification_service.mark_as_read(
        user_id=current_user.id,
        notification_id=notification_id,
    )
