from fastapi import APIRouter

from src.app.api.routes import (
    admin,
    bookings,
    favorites,
    guides,
    healthcheck,
    login,
    notifications,
    poe,
    reviews,
    routes,
    tours,
    users,
)

api_router = APIRouter()


api_router.include_router(
    users.router, tags=["users"], prefix="/users",
)
api_router.include_router(
    login.router, tags=["login"], prefix="/login",
)
api_router.include_router(
    healthcheck.router, tags=["healthcheck"],
)
api_router.include_router(
    poe.router, tags=["poe"], prefix="/poe",
)
api_router.include_router(
    poe.router, tags=["poes"], prefix="/poes", include_in_schema=False,
)
api_router.include_router(
    poe.map_router, tags=["map"], prefix="/map",
)
api_router.include_router(
    routes.router, tags=["routes"], prefix="/routes",
)
api_router.include_router(
    tours.router, tags=["tours"], prefix="/tours",
)
api_router.include_router(
    guides.router, tags=["guides"], prefix="/guides",
)
api_router.include_router(
    bookings.router, tags=["bookings"], prefix="/bookings",
)
api_router.include_router(
    favorites.router, tags=["favorites"], prefix="/favorites",
)
api_router.include_router(
    notifications.router, tags=["notifications"], prefix="/notifications",
)
api_router.include_router(
    reviews.router, tags=["reviews"],
)
api_router.include_router(
    admin.router, tags=["admin"], prefix="/admin",
)
