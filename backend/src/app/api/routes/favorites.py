from fastapi import APIRouter

from src.app.api.dependencies.common import FavoriteServiceDep
from src.app.api.dependencies.users import CurrentUser
from src.app.db.models.favorite import (
    FavoriteMutation,
    FavoriteMutationResponse,
    FavoritesResponse,
)

router = APIRouter()


@router.get("", response_model=FavoritesResponse)
@router.get("/", response_model=FavoritesResponse, include_in_schema=False)
async def read_favorites(
    favorite_service: FavoriteServiceDep,
    current_user: CurrentUser,
) -> FavoritesResponse:
    return await favorite_service.get_favorites(user_id=current_user.id)


@router.post("", response_model=FavoriteMutationResponse, status_code=201)
async def create_favorite(
    favorite_service: FavoriteServiceDep,
    current_user: CurrentUser,
    favorite_in: FavoriteMutation,
) -> FavoriteMutationResponse:
    return await favorite_service.add_favorite(
        user_id=current_user.id,
        favorite_in=favorite_in,
    )


@router.delete("", response_model=FavoriteMutationResponse)
async def delete_favorite(
    favorite_service: FavoriteServiceDep,
    current_user: CurrentUser,
    favorite_in: FavoriteMutation,
) -> FavoriteMutationResponse:
    return await favorite_service.remove_favorite(
        user_id=current_user.id,
        favorite_in=favorite_in,
    )
