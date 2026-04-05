from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from typing import Annotated, Any

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from src.app.core.settings import get_project_settings
from src.app.db.database import async_engine
from src.app.repositories.user import UserRepository
from src.app.service.user import UserService

project_settings = get_project_settings()

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{project_settings.API_V1_STR}/login/access-token",
)

async def get_db() -> AsyncGenerator[AsyncSession, Any]:
    async with AsyncSession(async_engine) as session:
        yield session

@asynccontextmanager
async def get_db_session() -> AsyncGenerator[AsyncSession, Any]:
    session = AsyncSession(async_engine)
    try:
        yield session
    finally:
        await session.close()

SessionDep = Annotated[AsyncSession, Depends(get_db)]
TokenDep = Annotated[str, Depends(reusable_oauth2)]


def get_user_repository(session: SessionDep) -> UserRepository:
    return UserRepository(session)


UserRepositoryDep = Annotated[UserRepository, Depends(get_user_repository)]


def get_user_service(user_repository: UserRepositoryDep) -> UserService:
    return UserService(user_repository)


UserServiceDep = Annotated[UserService, Depends(get_user_service)]
