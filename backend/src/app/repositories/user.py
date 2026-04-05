from collections.abc import Sequence
from typing import Any

from fastapi import HTTPException

from src.app.core.security import get_password_hash
from src.app.core.settings import get_project_settings
from src.app.db.models.user import User, UserCreate, UserUpdate
from src.app.repositories.base import BaseRepository

project_settings = get_project_settings()


class UserRepository(BaseRepository[User]):
    model = User

    async def get_user(self, **filters: Any) -> User | None:
        return await self.get_one_by(**filters)

    async def get_users(
        self,
        skip: int = 0,
        limit: int = project_settings.DEFAULT_QUERY_LIMIT,
    ) -> tuple[Sequence[User], int]:
        return await self.list_and_count(skip=skip, limit=limit)

    async def create_user(self, user_create: UserCreate) -> User:
        if await self.get_user(email=user_create.email):
            raise HTTPException(
                status_code=409,
                detail="Пользователь с таким email уже существует",
            )

        user = User.model_validate(
            user_create,
            update={
                "hashed_password": get_password_hash(user_create.password),
            },
        )
        return await self.add(user)

    async def update_user(
        self,
        db_user: User,
        user_in: UserUpdate,
    ) -> User:
        user_data = user_in.model_dump(exclude_unset=True)

        for key, value in user_data.items():
            setattr(db_user, key, value)

        return await self.add(db_user)
