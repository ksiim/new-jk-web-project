from fastapi import APIRouter, Depends, HTTPException

from src.app.api.dependencies.common import UserServiceDep
from src.app.api.dependencies.pagination import PaginationDep
from src.app.api.dependencies.users import (
    CurrentUser,
    UserOr404,
    verify_user_ownership,
)
from src.app.db.models.user import (
    UserPublic,
    UsersPublic,
    UserUpdate,
)
from src.app.db.models.user_preference import UserPreferencesResponse, UserPreferencesUpdate
from src.app.db.schemas import Message

router = APIRouter()


@router.get(
    "/",
    response_model=UsersPublic,
)
async def read_users(
    user_service: UserServiceDep,
    pagination: PaginationDep,
) -> UsersPublic:
    users = await user_service.get_users(
        page=pagination.page,
        limit=pagination.limit,
    )
    return users


@router.get("/me", response_model=UserPublic)
async def read_user_me(current_user: CurrentUser) -> UserPublic:
    """
    Retrieve information about the current authenticated user.
    """
    return UserPublic.model_validate(current_user)


@router.put("/me", response_model=UserPublic)
async def update_user_me(
    user_service: UserServiceDep,
    user_in: UserUpdate,
    current_user: CurrentUser,
) -> UserPublic:
    """
    Update the current authenticated user's information.
    """
    user = await user_service.update_user(
        db_user=current_user,
        user_in=user_in,
    )
    return user


@router.get("/me/preferences", response_model=UserPreferencesResponse)
async def read_user_preferences(
    user_service: UserServiceDep,
    current_user: CurrentUser,
) -> UserPreferencesResponse:
    return await user_service.get_preferences(user_id=current_user.id)


@router.put("/me/preferences", response_model=UserPreferencesResponse)
async def update_user_preferences(
    user_service: UserServiceDep,
    preferences_in: UserPreferencesUpdate,
    current_user: CurrentUser,
) -> UserPreferencesResponse:
    return await user_service.update_preferences(
        user_id=current_user.id,
        preferences_in=preferences_in,
    )


@router.delete("/me", response_model=Message)
async def delete_user_me(
    user_service: UserServiceDep,
    current_user: CurrentUser,
) -> Message:
    """
    Delete the current authenticated user.
    """
    if await user_service.delete_user(current_user):
        return Message(message="User deleted successfully")
    raise HTTPException(
        status_code=500,
        detail="Failed to delete user",
    )


@router.get(
    "/{user_id}",
    response_model=UserPublic,
)
async def read_user_by_id(
    user: UserOr404,
) -> UserPublic:
    """
    Retrieve a user by their ID.
    """
    return UserPublic.model_validate(user)


@router.put(
    "/{user_id}",
    dependencies=[Depends(verify_user_ownership)],
    response_model=UserPublic,
)
async def update_user(
    user_service: UserServiceDep,
    user_in: UserUpdate,
    db_user: UserOr404,
) -> UserPublic:
    """
    Update a user's information.
    """
    user = await user_service.update_user(
        db_user=db_user,
        user_in=user_in,
    )
    return user

@router.delete(
    "/{user_id}",
    # dependencies=[Depends(verify_user_ownership)],
    response_model=Message,
)
async def delete_user(
    user_service: UserServiceDep,
    user_in: UserOr404,
) -> Message:
    """
    Delete a user by their ID.
    """
    if await user_service.delete_user(user_in):
        return Message(message="User deleted successfully")
    raise HTTPException(
        status_code=500,
        detail="Failed to delete user",
    )
