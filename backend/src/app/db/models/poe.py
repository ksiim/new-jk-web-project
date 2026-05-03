import datetime
import uuid

from pydantic import ConfigDict
from pydantic import Field as PydanticField
from sqlalchemy import JSON, Column
from sqlmodel import Field, SQLModel

from src.app.db.schemas import ListResponse


def build_poe_id() -> str:
    return f"poe_{uuid.uuid4().hex[:12]}"


class Location(SQLModel):
    lat: float
    lng: float
    address: str | None = None


class PoeAccessibility(SQLModel):
    wheelchair_accessible: bool = False
    has_ramp: bool = False
    has_stairs: bool = False


class OpeningHoursItem(SQLModel):
    model_config = ConfigDict(populate_by_name=True)

    day: str
    from_: str = PydanticField(alias="from")
    to: str


class PoeBase(SQLModel):
    city_id: str = Field(index=True, max_length=64)
    title: str = Field(max_length=255)
    description: str
    category: str = Field(index=True, max_length=64)
    tags: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    lat: float = Field(index=True)
    lng: float = Field(index=True)
    address: str | None = Field(default=None, max_length=512)
    wheelchair_accessible: bool = Field(default=False, index=True)
    has_ramp: bool = False
    has_stairs: bool = False
    rating: float = Field(default=0.0, ge=0, le=5)
    reviews_count: int = Field(default=0, ge=0)
    duration_minutes: int = Field(default=30, ge=1)
    images: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    opening_hours: list[dict[str, str]] = Field(default_factory=list, sa_column=Column(JSON))


class PoeStatus(str):
    ACTIVE = "active"
    HIDDEN = "hidden"
    DELETED = "deleted"


class Poe(PoeBase, table=True):
    __tablename__ = "poes"  # type: ignore

    id: str = Field(default_factory=build_poe_id, primary_key=True, max_length=32)
    status: str = Field(default=PoeStatus.ACTIVE, index=True, max_length=32)
    moderation_reason: str | None = Field(default=None, max_length=1024)
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.now)


class PoeCreate(PoeBase):
    opening_hours: list[OpeningHoursItem] = Field(default_factory=list)


class PoeUpdate(SQLModel):
    title: str | None = Field(default=None, max_length=255)
    description: str | None = None
    category: str | None = Field(default=None, max_length=64)
    tags: list[str] | None = None
    lat: float | None = None
    lng: float | None = None
    address: str | None = Field(default=None, max_length=512)
    wheelchair_accessible: bool | None = None
    has_ramp: bool | None = None
    has_stairs: bool | None = None
    duration_minutes: int | None = Field(default=None, ge=1)
    images: list[str] | None = None
    opening_hours: list[OpeningHoursItem] | None = None


class PoeModerationDecision(SQLModel):
    reason: str | None = Field(default=None, max_length=1024)


class PoePublic(SQLModel):
    id: str
    title: str
    description: str
    category: str
    tags: list[str]
    location: Location
    accessibility: PoeAccessibility
    rating: float
    reviews_count: int
    duration_minutes: int
    images: list[str]


class PoeDetail(PoePublic):
    opening_hours: list[OpeningHoursItem] = Field(default_factory=list)


class PoeMapItem(SQLModel):
    id: str
    title: str
    category: str
    lat: float
    lng: float
    badge: str
    is_accessible: bool


class PoeTaxonomyType(str):
    CATEGORY = "category"
    TAG = "tag"


class PoeTaxonomyStatus(str):
    ACTIVE = "active"
    ARCHIVED = "archived"


class PoeTaxonomy(SQLModel, table=True):
    __tablename__ = "poe_taxonomies"  # type: ignore

    id: str = Field(
        default_factory=lambda: f"tax_{uuid.uuid4().hex[:12]}",
        primary_key=True,
        max_length=32,
    )
    type: str = Field(index=True, max_length=32)
    value: str = Field(index=True, max_length=128)
    status: str = Field(default=PoeTaxonomyStatus.ACTIVE, index=True, max_length=32)
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.now)


class PoeTaxonomyCreate(SQLModel):
    type: str
    value: str


class PoeTaxonomyUpdate(SQLModel):
    value: str | None = None


class PoeTaxonomyPublic(SQLModel):
    id: str
    type: str
    value: str
    status: str


PoesPublic = ListResponse[PoePublic]
PoeTaxonomiesPublic = ListResponse[PoeTaxonomyPublic]
