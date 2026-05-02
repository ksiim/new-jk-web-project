import datetime
import uuid

from sqlalchemy import Column, ForeignKey, UniqueConstraint
from sqlmodel import Field, SQLModel

from src.app.const import Variants
from src.app.db.schemas import DetailResponse


def build_favorite_id() -> str:
    return f"fav_{uuid.uuid4().hex[:12]}"


class FavoriteEntityType(Variants):
    TOUR = "tour"
    ROUTE = "route"
    POE = "poe"


class Favorite(SQLModel, table=True):
    __tablename__ = "favorites"  # type: ignore
    __table_args__ = (
        UniqueConstraint("user_id", "entity_type", "entity_id", name="uq_favorites_user_entity"),
    )

    id: str = Field(default_factory=build_favorite_id, primary_key=True, max_length=32)
    user_id: uuid.UUID = Field(
        sa_column=Column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False),
    )
    entity_type: FavoriteEntityType = Field(index=True)
    entity_id: str = Field(index=True, max_length=32)
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.now)


class FavoriteItem(SQLModel):
    id: str
    title: str


class FavoritesPublic(SQLModel):
    tours: list[FavoriteItem]
    routes: list[FavoriteItem]
    poes: list[FavoriteItem]


class FavoriteMutation(SQLModel):
    entity_type: FavoriteEntityType
    entity_id: str


class FavoriteMutationPublic(SQLModel):
    entity_type: FavoriteEntityType
    entity_id: str
    is_favorite: bool


FavoritesResponse = DetailResponse[FavoritesPublic]
FavoriteMutationResponse = DetailResponse[FavoriteMutationPublic]
