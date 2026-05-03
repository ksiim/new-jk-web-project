from uuid import UUID

from fastapi import HTTPException

from src.app.db.models.favorite import (
    Favorite,
    FavoriteEntityType,
    FavoriteItem,
    FavoriteMutation,
    FavoriteMutationPublic,
    FavoriteMutationResponse,
    FavoritesPublic,
    FavoritesResponse,
)
from src.app.db.schemas import DetailResponse
from src.app.repositories.favorite import FavoriteRepository
from src.app.service.base import BaseService


class FavoriteService(BaseService[FavoriteRepository]):
    async def get_favorites(self, user_id: UUID) -> FavoritesResponse:
        favorites = await self.repository.list_user_favorites(user_id=user_id)
        tour_ids = [
            favorite.entity_id
            for favorite in favorites
            if favorite.entity_type == FavoriteEntityType.TOUR
        ]
        route_ids = [
            favorite.entity_id
            for favorite in favorites
            if favorite.entity_type == FavoriteEntityType.ROUTE
        ]
        poe_ids = [
            favorite.entity_id
            for favorite in favorites
            if favorite.entity_type == FavoriteEntityType.POE
        ]
        tours_map = await self.repository.get_tours_map(ids=tour_ids)
        routes_map = await self.repository.get_routes_map(ids=route_ids, user_id=user_id)
        poes_map = await self.repository.get_poes_map(ids=poe_ids)
        return DetailResponse(
            data=FavoritesPublic(
                tours=[
                    FavoriteItem(id=favorite.entity_id, title=tours_map[favorite.entity_id].title)
                    for favorite in favorites
                    if favorite.entity_type == FavoriteEntityType.TOUR
                    and favorite.entity_id in tours_map
                ],
                routes=[
                    FavoriteItem(id=favorite.entity_id, title=routes_map[favorite.entity_id].title)
                    for favorite in favorites
                    if favorite.entity_type == FavoriteEntityType.ROUTE
                    and favorite.entity_id in routes_map
                ],
                poes=[
                    FavoriteItem(id=favorite.entity_id, title=poes_map[favorite.entity_id].title)
                    for favorite in favorites
                    if favorite.entity_type == FavoriteEntityType.POE
                    and favorite.entity_id in poes_map
                ],
            ),
        )

    async def add_favorite(
        self,
        *,
        user_id: UUID,
        favorite_in: FavoriteMutation,
    ) -> FavoriteMutationResponse:
        if not await self.repository.entity_exists(
            user_id=user_id,
            entity_type=favorite_in.entity_type,
            entity_id=favorite_in.entity_id,
        ):
            raise HTTPException(status_code=404, detail="Entity not found")
        existing = await self.repository.get_by_entity(
            user_id=user_id,
            entity_type=favorite_in.entity_type,
            entity_id=favorite_in.entity_id,
        )
        if existing is None:
            await self.repository.add(
                Favorite(
                    user_id=user_id,
                    entity_type=favorite_in.entity_type,
                    entity_id=favorite_in.entity_id,
                ),
            )
        return DetailResponse(
            data=FavoriteMutationPublic(
                entity_type=favorite_in.entity_type,
                entity_id=favorite_in.entity_id,
                is_favorite=True,
            ),
        )

    async def remove_favorite(
        self,
        *,
        user_id: UUID,
        favorite_in: FavoriteMutation,
    ) -> FavoriteMutationResponse:
        await self.repository.delete_by_entity(
            user_id=user_id,
            entity_type=favorite_in.entity_type,
            entity_id=favorite_in.entity_id,
        )
        return DetailResponse(
            data=FavoriteMutationPublic(
                entity_type=favorite_in.entity_type,
                entity_id=favorite_in.entity_id,
                is_favorite=False,
            ),
        )
