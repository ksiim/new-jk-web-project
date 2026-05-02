from __future__ import annotations

import datetime

import pytest
from fastapi import HTTPException

from src.app.db.models.notification import Notification
from src.app.service.notification import NotificationService


class FakeNotificationRepository:
    def __init__(self):
        self.items: list[Notification] = []

    async def list_user_notifications(self, user_id, skip, limit):
        items = [item for item in self.items if item.user_id == user_id]
        return items[skip : skip + limit], len(items)

    async def get_by_id(self, notification_id):
        for item in self.items:
            if item.id == notification_id:
                return item
        return None

    async def add(self, entity):
        for idx, item in enumerate(self.items):
            if item.id == entity.id:
                self.items[idx] = entity
                return entity
        self.items.append(entity)
        return entity


@pytest.mark.asyncio
async def test_create_event_and_list(sample_user):
    repo = FakeNotificationRepository()
    service = NotificationService(repo)
    await service.create_event(sample_user.id, "route_ready", "Route ready", "route_1")
    response = await service.get_notifications(sample_user.id, page=1, limit=20)
    assert response.meta.total == 1
    assert response.data[0].event_type == "route_ready"


@pytest.mark.asyncio
async def test_mark_as_read(sample_user):
    repo = FakeNotificationRepository()
    service = NotificationService(repo)
    notification = Notification(
        user_id=sample_user.id,
        event_type="booking_confirmed",
        title="confirmed",
        payload="booking_1",
        is_read=False,
        created_at=datetime.datetime.now(),
    )
    await repo.add(notification)
    response = await service.mark_as_read(sample_user.id, notification.id)
    assert response.data.is_read is True


@pytest.mark.asyncio
async def test_mark_as_read_raises_for_missing(sample_user):
    repo = FakeNotificationRepository()
    service = NotificationService(repo)
    with pytest.raises(HTTPException) as exc:
        await service.mark_as_read(sample_user.id, "missing")
    assert exc.value.status_code == 404
