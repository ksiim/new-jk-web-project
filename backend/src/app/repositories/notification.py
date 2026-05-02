import uuid
from collections.abc import Sequence

from sqlalchemy import func, select

from src.app.db.models.notification import Notification
from src.app.repositories.base import BaseRepository


class NotificationRepository(BaseRepository[Notification]):
    model = Notification

    async def list_user_notifications(
        self,
        user_id: uuid.UUID,
        skip: int,
        limit: int,
    ) -> tuple[Sequence[Notification], int]:
        statement = (
            select(Notification)
            .where(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
        )
        items = (await self.session.execute(statement.offset(skip).limit(limit))).scalars().all()
        total_statement = (
            select(func.count())
            .select_from(Notification)
            .where(Notification.user_id == user_id)
        )
        total = int((await self.session.execute(total_statement)).scalar_one())
        return items, total
