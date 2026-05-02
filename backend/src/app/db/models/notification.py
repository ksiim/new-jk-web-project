import datetime
import uuid

from sqlalchemy import Column, ForeignKey
from sqlmodel import Field, SQLModel

from src.app.db.schemas import DetailResponse, ListResponse


def build_notification_id() -> str:
    return f"ntf_{uuid.uuid4().hex[:12]}"


class Notification(SQLModel, table=True):
    __tablename__ = "notifications"  # type: ignore

    id: str = Field(default_factory=build_notification_id, primary_key=True, max_length=32)
    user_id: uuid.UUID = Field(
        sa_column=Column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False),
    )
    event_type: str = Field(index=True, max_length=64)
    title: str = Field(max_length=255)
    payload: str | None = None
    is_read: bool = Field(default=False, index=True)
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.now)


class NotificationPublic(SQLModel):
    id: str
    event_type: str
    title: str
    payload: str | None
    is_read: bool
    created_at: datetime.datetime


NotificationsPublic = ListResponse[NotificationPublic]
NotificationResponse = DetailResponse[NotificationPublic]
