import uuid

from fastapi import HTTPException

from src.app.db.models.notification import (
    Notification,
    NotificationPublic,
    NotificationResponse,
    NotificationsPublic,
)
from src.app.db.schemas import DetailResponse, PaginationMeta
from src.app.repositories.notification import NotificationRepository
from src.app.service.base import BaseService


class NotificationService(BaseService[NotificationRepository]):
    async def get_notifications(
        self,
        user_id: uuid.UUID,
        page: int,
        limit: int,
    ) -> NotificationsPublic:
        items, total = await self.repository.list_user_notifications(
            user_id=user_id,
            skip=(page - 1) * limit,
            limit=limit,
        )
        return NotificationsPublic(
            data=[self._to_public(item) for item in items],
            meta=PaginationMeta.create(page=page, limit=limit, total=total),
        )

    async def mark_as_read(self, user_id: uuid.UUID, notification_id: str) -> NotificationResponse:
        notification = await self.repository.get_by_id(notification_id)
        if not notification or notification.user_id != user_id:
            raise HTTPException(status_code=404, detail="Notification not found")
        notification.is_read = True
        notification = await self.repository.add(notification)
        return DetailResponse(data=self._to_public(notification))

    async def create_event(
        self,
        user_id: uuid.UUID,
        event_type: str,
        title: str,
        payload: str | None = None,
    ) -> NotificationResponse:
        notification = await self.repository.add(
            Notification(
                user_id=user_id,
                event_type=event_type,
                title=title,
                payload=payload,
            ),
        )
        return DetailResponse(data=self._to_public(notification))

    def _to_public(self, notification: Notification) -> NotificationPublic:
        return NotificationPublic(
            id=notification.id,
            event_type=notification.event_type,
            title=notification.title,
            payload=notification.payload,
            is_read=notification.is_read,
            created_at=notification.created_at,
        )
