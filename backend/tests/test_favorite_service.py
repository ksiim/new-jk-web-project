from __future__ import annotations

import pytest
from fastapi import HTTPException

from src.app.db.models.favorite import Favorite, FavoriteEntityType, FavoriteMutation
from src.app.service.favorite import FavoriteService


class FakeFavoriteRepository:
    def __init__(self, favorites=None, tours_map=None, routes_map=None, poes_map=None, exists=True):
        self.favorites = favorites or []
        self.tours_map = tours_map or {}
        self.routes_map = routes_map or {}
        self.poes_map = poes_map or {}
        self.exists = exists

    async def list_user_favorites(self, user_id):
        return [favorite for favorite in self.favorites if favorite.user_id == user_id]

    async def get_tours_map(self, ids):
        return {item_id: self.tours_map[item_id] for item_id in ids if item_id in self.tours_map}

    async def get_routes_map(self, ids, user_id):
        return {item_id: self.routes_map[item_id] for item_id in ids if item_id in self.routes_map}

    async def get_poes_map(self, ids):
        return {item_id: self.poes_map[item_id] for item_id in ids if item_id in self.poes_map}

    async def entity_exists(self, user_id, entity_type, entity_id):
        return self.exists

    async def get_by_entity(self, user_id, entity_type, entity_id):
        for favorite in self.favorites:
            if (
                favorite.user_id == user_id
                and favorite.entity_type == entity_type
                and favorite.entity_id == entity_id
            ):
                return favorite
        return None

    async def add(self, favorite):
        self.favorites.append(favorite)
        return favorite

    async def delete_by_entity(self, user_id, entity_type, entity_id):
        self.favorites = [
            favorite
            for favorite in self.favorites
            if not (
                favorite.user_id == user_id
                and favorite.entity_type == entity_type
                and favorite.entity_id == entity_id
            )
        ]


@pytest.mark.asyncio
async def test_get_favorites_groups_entities(sample_user, sample_tour, sample_poe):
    route = type("RouteLike", (), {"id": "route_1", "title": "My route"})()
    favorites = [
        Favorite(user_id=sample_user.id, entity_type=FavoriteEntityType.TOUR, entity_id=sample_tour.id),
        Favorite(user_id=sample_user.id, entity_type=FavoriteEntityType.ROUTE, entity_id=route.id),
        Favorite(user_id=sample_user.id, entity_type=FavoriteEntityType.POE, entity_id=sample_poe.id),
    ]
    repository = FakeFavoriteRepository(
        favorites=favorites,
        tours_map={sample_tour.id: sample_tour},
        routes_map={route.id: route},
        poes_map={sample_poe.id: sample_poe},
    )

    response = await FavoriteService(repository).get_favorites(user_id=sample_user.id)

    assert response.data.tours[0].id == sample_tour.id
    assert response.data.routes[0].title == "My route"
    assert response.data.poes[0].title == sample_poe.title


@pytest.mark.asyncio
async def test_add_favorite_creates_entry(sample_user):
    repository = FakeFavoriteRepository()
    response = await FavoriteService(repository).add_favorite(
        user_id=sample_user.id,
        favorite_in=FavoriteMutation(
            entity_type=FavoriteEntityType.TOUR,
            entity_id="tour_1",
        ),
    )
    assert response.data.is_favorite is True
    assert len(repository.favorites) == 1


@pytest.mark.asyncio
async def test_add_favorite_raises_for_missing_entity(sample_user):
    repository = FakeFavoriteRepository(exists=False)
    with pytest.raises(HTTPException) as exc:
        await FavoriteService(repository).add_favorite(
            user_id=sample_user.id,
            favorite_in=FavoriteMutation(
                entity_type=FavoriteEntityType.TOUR,
                entity_id="tour_1",
            ),
        )
    assert exc.value.status_code == 404


@pytest.mark.asyncio
async def test_remove_favorite_returns_false_state(sample_user):
    favorite = Favorite(
        user_id=sample_user.id,
        entity_type=FavoriteEntityType.POE,
        entity_id="poe_1",
    )
    repository = FakeFavoriteRepository(favorites=[favorite])
    response = await FavoriteService(repository).remove_favorite(
        user_id=sample_user.id,
        favorite_in=FavoriteMutation(
            entity_type=FavoriteEntityType.POE,
            entity_id="poe_1",
        ),
    )
    assert response.data.is_favorite is False
    assert repository.favorites == []
