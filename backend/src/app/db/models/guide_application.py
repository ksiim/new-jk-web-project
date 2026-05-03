import datetime
import uuid

from sqlalchemy import JSON, Column, ForeignKey
from sqlmodel import Field, SQLModel

from src.app.const import Variants
from src.app.db.schemas import DetailResponse, ListResponse


def build_guide_application_id() -> str:
    return f"gapp_{uuid.uuid4().hex[:12]}"


class GuideApplicationStatus(Variants):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class GuideApplication(SQLModel, table=True):
    __tablename__ = "guide_applications"  # type: ignore

    id: str = Field(default_factory=build_guide_application_id, primary_key=True, max_length=32)
    user_id: uuid.UUID = Field(
        sa_column=Column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False),
    )
    payload: dict = Field(default_factory=dict, sa_column=Column(JSON))
    status: GuideApplicationStatus = Field(default=GuideApplicationStatus.PENDING, index=True)
    reviewed_by: uuid.UUID | None = Field(
        default=None,
        sa_column=Column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
    )
    reviewed_at: datetime.datetime | None = None
    rejection_reason: str | None = Field(default=None, max_length=1024)
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.now)


class GuideApplicationCreate(SQLModel):
    payload: dict = Field(default_factory=dict)


class GuideApplicationDecision(SQLModel):
    reason: str | None = Field(default=None, max_length=1024)


class GuideApplicationPublic(SQLModel):
    id: str
    user_id: uuid.UUID
    payload: dict
    status: GuideApplicationStatus
    reviewed_by: uuid.UUID | None = None
    reviewed_at: datetime.datetime | None = None
    rejection_reason: str | None = None
    created_at: datetime.datetime


GuideApplicationResponse = DetailResponse[GuideApplicationPublic]
GuideApplicationsPublic = ListResponse[GuideApplicationPublic]
