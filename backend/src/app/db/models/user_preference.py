import uuid

from sqlalchemy import JSON, Column, ForeignKey
from sqlmodel import Field, SQLModel

from src.app.const import Variants
from src.app.db.schemas import DetailResponse


class PreferencePace(Variants):
    SLOW = "slow"
    MEDIUM = "medium"
    FAST = "fast"


class BudgetLevel(Variants):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class PreferenceAccessibility(SQLModel):
    wheelchair_required: bool = False
    avoid_stairs: bool = False
    need_rest_points: bool = False
    with_children: bool = False
    audio_preferred: bool = False


class UserPreferences(SQLModel, table=True):
    __tablename__ = "user_preferences"  # type: ignore

    user_id: uuid.UUID = Field(
        sa_column=Column(
            ForeignKey("users.id", ondelete="CASCADE"),
            primary_key=True,
            nullable=False,
        ),
    )
    interests: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    pace: PreferencePace = Field(default=PreferencePace.MEDIUM)
    budget_level: BudgetLevel = Field(default=BudgetLevel.MEDIUM)
    wheelchair_required: bool = False
    avoid_stairs: bool = False
    need_rest_points: bool = False
    with_children: bool = False
    audio_preferred: bool = False


class UserPreferencesPublic(SQLModel):
    interests: list[str]
    pace: PreferencePace
    budget_level: BudgetLevel
    accessibility: PreferenceAccessibility


class UserPreferencesUpdate(SQLModel):
    interests: list[str] = Field(default_factory=list)
    pace: PreferencePace = PreferencePace.MEDIUM
    budget_level: BudgetLevel = BudgetLevel.MEDIUM
    accessibility: PreferenceAccessibility = Field(default_factory=PreferenceAccessibility)


UserPreferencesResponse = DetailResponse[UserPreferencesPublic]
