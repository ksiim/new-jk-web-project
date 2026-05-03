import datetime
import uuid

from sqlalchemy import Column, ForeignKey, String
from sqlmodel import Field, SQLModel

from src.app.const import Variants
from src.app.db.models.poe import Location
from src.app.db.schemas import DetailResponse, ListResponse


def build_route_id() -> str:
    return f"route_{uuid.uuid4().hex[:12]}"


class Pace(Variants):
    SLOW = "slow"
    MEDIUM = "medium"
    FAST = "fast"


class RouteStatus(Variants):
    DRAFT = "draft"
    SAVED = "saved"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class RouteSource(Variants):
    GENERATED = "generated"
    MANUAL = "manual"


class Route(SQLModel, table=True):
    __tablename__ = "routes"  # type: ignore

    id: str = Field(default_factory=build_route_id, primary_key=True, max_length=32)
    user_id: uuid.UUID | None = Field(
        default=None,
        sa_column=Column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=True),
    )
    title: str = Field(max_length=255)
    description: str
    city_id: str = Field(index=True, max_length=64)
    status: RouteStatus = Field(default=RouteStatus.DRAFT, index=True)
    source: RouteSource = Field(default=RouteSource.GENERATED, index=True)
    duration_minutes: int = Field(ge=1)
    distance_meters: int = Field(default=0, ge=0)
    pace: Pace = Field(default=Pace.MEDIUM)
    start_lat: float | None = None
    start_lng: float | None = None
    start_address: str | None = Field(default=None, max_length=512)
    accessibility_score: int = Field(default=0, ge=0, le=100)
    started_at: datetime.datetime | None = None
    completed_at: datetime.datetime | None = None
    progress_order: int = Field(default=0, ge=0)
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.now)


class RoutePoint(SQLModel, table=True):
    __tablename__ = "route_points"  # type: ignore

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    route_id: str = Field(
        sa_column=Column(
            String(32),
            ForeignKey("routes.id", ondelete="CASCADE"),
            index=True,
            nullable=False,
        ),
    )
    order: int = Field(index=True, ge=1)
    poe_id: str = Field(
        sa_column=Column(String(32), ForeignKey("poes.id"), index=True, nullable=False),
    )
    planned_stop_minutes: int = Field(ge=1)


class RouteAccessibilityRequest(SQLModel):
    wheelchair_required: bool = False
    avoid_stairs: bool = False
    need_rest_points: bool = False


class RouteGenerateRequest(SQLModel):
    city_id: str
    interests: list[str] = Field(default_factory=list)
    start_location: Location
    duration_minutes: int = Field(default=180, ge=30)
    pace: Pace = Pace.MEDIUM
    budget_level: str = Field(default="medium")
    accessibility: RouteAccessibilityRequest = Field(default_factory=RouteAccessibilityRequest)


class RoutePointPublic(SQLModel):
    order: int
    poe_id: str
    planned_stop_minutes: int


class RouteListItemPublic(SQLModel):
    id: str
    title: str
    status: RouteStatus
    source: RouteSource
    duration_minutes: int
    distance_meters: int
    created_at: datetime.datetime


class RoutePoeShort(SQLModel):
    id: str
    title: str
    category: str


class RoutePointDetailPublic(SQLModel):
    order: int
    poe: RoutePoeShort
    planned_stop_minutes: int


class RouteDetailPublic(SQLModel):
    id: str
    title: str
    description: str
    city_id: str
    status: RouteStatus
    source: RouteSource
    duration_minutes: int
    distance_meters: int
    pace: Pace
    start_point: Location
    points: list[RoutePointDetailPublic]
    accessibility_score: int
    created_at: datetime.datetime


class RouteSavedPublic(SQLModel):
    id: str
    status: RouteStatus


class RouteJourneyPublic(SQLModel):
    id: str
    status: RouteStatus
    progress_order: int
    started_at: datetime.datetime | None = None
    completed_at: datetime.datetime | None = None


class RouteProgressUpdate(SQLModel):
    order: int = Field(ge=1)


class RoutePointEdit(SQLModel):
    poe_id: str
    planned_stop_minutes: int = Field(ge=1)


class RouteManualUpdate(SQLModel):
    title: str | None = Field(default=None, max_length=255)
    description: str | None = None
    points: list[RoutePointEdit] | None = None


class RouteGeneratedPublic(SQLModel):
    id: str
    title: str
    description: str
    city_id: str
    status: RouteStatus
    source: RouteSource
    duration_minutes: int
    distance_meters: int
    pace: Pace
    points: list[RoutePointPublic]
    accessibility_score: int


RouteGenerateResponse = DetailResponse[RouteGeneratedPublic]
RoutesPublic = ListResponse[RouteListItemPublic]
RouteResponse = DetailResponse[RouteDetailPublic]
RouteSaveResponse = DetailResponse[RouteSavedPublic]
RouteJourneyResponse = DetailResponse[RouteJourneyPublic]
