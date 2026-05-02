from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from typing import Annotated, Any

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from src.app.core.settings import get_project_settings
from src.app.db.database import async_engine
from src.app.repositories.booking import BookingRepository
from src.app.repositories.favorite import FavoriteRepository
from src.app.repositories.notification import NotificationRepository
from src.app.repositories.poe import PoeRepository
from src.app.repositories.review import ReviewRepository
from src.app.repositories.route import RouteRepository
from src.app.repositories.tour import TourRepository
from src.app.repositories.user import UserRepository
from src.app.service.booking import BookingService
from src.app.service.favorite import FavoriteService
from src.app.service.notification import NotificationService
from src.app.service.poe import PoeService
from src.app.service.review import ReviewService
from src.app.service.route import RouteService
from src.app.service.tour import TourService
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


def get_poe_repository(session: SessionDep) -> PoeRepository:
    return PoeRepository(session)


PoeRepositoryDep = Annotated[PoeRepository, Depends(get_poe_repository)]


def get_favorite_repository(session: SessionDep) -> FavoriteRepository:
    return FavoriteRepository(session)


FavoriteRepositoryDep = Annotated[FavoriteRepository, Depends(get_favorite_repository)]


def get_route_repository(session: SessionDep) -> RouteRepository:
    return RouteRepository(session)


RouteRepositoryDep = Annotated[RouteRepository, Depends(get_route_repository)]


def get_tour_repository(session: SessionDep) -> TourRepository:
    return TourRepository(session)


TourRepositoryDep = Annotated[TourRepository, Depends(get_tour_repository)]


def get_booking_repository(session: SessionDep) -> BookingRepository:
    return BookingRepository(session)


BookingRepositoryDep = Annotated[BookingRepository, Depends(get_booking_repository)]


def get_review_repository(session: SessionDep) -> ReviewRepository:
    return ReviewRepository(session)


ReviewRepositoryDep = Annotated[ReviewRepository, Depends(get_review_repository)]


def get_notification_repository(session: SessionDep) -> NotificationRepository:
    return NotificationRepository(session)


NotificationRepositoryDep = Annotated[NotificationRepository, Depends(get_notification_repository)]


def get_user_service(user_repository: UserRepositoryDep) -> UserService:
    return UserService(user_repository)


UserServiceDep = Annotated[UserService, Depends(get_user_service)]


def get_poe_service(poe_repository: PoeRepositoryDep) -> PoeService:
    return PoeService(poe_repository)


PoeServiceDep = Annotated[PoeService, Depends(get_poe_service)]


def get_favorite_service(favorite_repository: FavoriteRepositoryDep) -> FavoriteService:
    return FavoriteService(favorite_repository)


FavoriteServiceDep = Annotated[FavoriteService, Depends(get_favorite_service)]


def get_route_service(
    route_repository: RouteRepositoryDep,
    poe_repository: PoeRepositoryDep,
) -> RouteService:
    return RouteService(route_repository, poe_repository)


RouteServiceDep = Annotated[RouteService, Depends(get_route_service)]


def get_tour_service(tour_repository: TourRepositoryDep) -> TourService:
    return TourService(tour_repository)


TourServiceDep = Annotated[TourService, Depends(get_tour_service)]


def get_booking_service(booking_repository: BookingRepositoryDep) -> BookingService:
    return BookingService(booking_repository)


BookingServiceDep = Annotated[BookingService, Depends(get_booking_service)]


def get_review_service(review_repository: ReviewRepositoryDep) -> ReviewService:
    return ReviewService(review_repository)


ReviewServiceDep = Annotated[ReviewService, Depends(get_review_service)]


def get_notification_service(
    notification_repository: NotificationRepositoryDep,
) -> NotificationService:
    return NotificationService(notification_repository)


NotificationServiceDep = Annotated[NotificationService, Depends(get_notification_service)]
