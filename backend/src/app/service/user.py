from src.app.core.security import verify_password
from src.app.core.settings import get_project_settings
from src.app.db.models.user import User, UserCreate, UserPublic, UsersPublic, UserUpdate
from src.app.db.schemas import PaginationMeta
from src.app.repositories.user import UserRepository
from src.app.service.base import BaseService

project_settings = get_project_settings()

class UserService(BaseService[UserRepository]):
    async def authenticate(self, *, email: str, password: str) -> User | None:
        db_user = await self.repository.get_user(email=email)
        if not db_user:
            return None
        if not verify_password(password, db_user.hashed_password):
            return None
        return db_user

    async def get_user(self, **filters: object) -> UserPublic | None:
        if not (user := await self.repository.get_user(**filters)):
            return None
        return UserPublic.model_validate(user)

    async def get_users(
        self,
        page: int = 1,
        limit: int = project_settings.DEFAULT_QUERY_LIMIT,
    ) -> UsersPublic:
        skip = (page - 1) * limit
        users, total = await self.repository.get_users(skip, limit)
        return UsersPublic(
            data=[UserPublic.model_validate(user) for user in users],
            meta=PaginationMeta.create(page=page, limit=limit, total=total),
        )

    async def create_user(self, user_in: UserCreate) -> UserPublic:
        return UserPublic.model_validate(
            await self.repository.create_user(user_in),
        )

    async def update_user(
        self,
        db_user: User,
        user_in: UserUpdate,
    ) -> UserPublic:
        return UserPublic.model_validate(
            await self.repository.update_user(
                db_user=db_user,
                user_in=user_in,
            ),
        )

    async def delete_user(self, user_in: User) -> bool:
        return await self.repository.delete(user_in)
