from collections.abc import Sequence
from uuid import UUID

from sqlalchemy import delete, select

from src.app.db.models.favorite import Favorite, FavoriteEntityType
from src.app.db.models.poe import Poe
from src.app.db.models.route import Route
from src.app.db.models.tour import Tour
from src.app.repositories.base import BaseRepository


class FavoriteRepository(BaseRepository[Favorite]):
    model = Favorite

    async def list_user_favorites(self, user_id: UUID) -> Sequence[Favorite]:
        statement = (
            select(Favorite)
            .where(Favorite.user_id == user_id)
            .order_by(Favorite.created_at.desc())
        )
        result = await self.session.execute(statement)
        return result.scalars().all()

    async def get_by_entity(
        self,
        *,
        user_id: UUID,
        entity_type: FavoriteEntityType,
        entity_id: str,
    ) -> Favorite | None:
        statement = select(Favorite).where(
            Favorite.user_id == user_id,
            Favorite.entity_type == entity_type,
            Favorite.entity_id == entity_id,
        )
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()

    async def delete_by_entity(
        self,
        *,
        user_id: UUID,
        entity_type: FavoriteEntityType,
        entity_id: str,
    ) -> None:
        await self.session.execute(
            delete(Favorite).where(
                Favorite.user_id == user_id,
                Favorite.entity_type == entity_type,
                Favorite.entity_id == entity_id,
            ),
        )
        await self.session.commit()

    async def get_tours_map(self, ids: list[str]) -> dict[str, Tour]:
        if not ids:
            return {}
        statement = select(Tour).where(Tour.id.in_(ids))
        rows = (await self.session.execute(statement)).scalars().all()
        return {tour.id: tour for tour in rows}

    async def get_routes_map(self, ids: list[str], user_id: UUID) -> dict[str, Route]:
        if not ids:
            return {}
        statement = select(Route).where(Route.id.in_(ids), Route.user_id == user_id)
        rows = (await self.session.execute(statement)).scalars().all()
        return {route.id: route for route in rows}

    async def get_poes_map(self, ids: list[str]) -> dict[str, Poe]:
        if not ids:
            return {}
        statement = select(Poe).where(Poe.id.in_(ids))
        rows = (await self.session.execute(statement)).scalars().all()
        return {poe.id: poe for poe in rows}

    async def entity_exists(
        self,
        *,
        user_id: UUID,
        entity_type: FavoriteEntityType,
        entity_id: str,
    ) -> bool:
        if entity_type == FavoriteEntityType.TOUR:
            return await self.session.get(Tour, entity_id) is not None
        if entity_type == FavoriteEntityType.POE:
            return await self.session.get(Poe, entity_id) is not None
        route = await self.session.get(Route, entity_id)
        return route is not None and route.user_id == user_id
