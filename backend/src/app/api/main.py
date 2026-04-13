from fastapi import APIRouter

from src.app.api.routes import (
    healthcheck,
    login,
    poe,
    routes,
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
