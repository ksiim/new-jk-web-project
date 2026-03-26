from fastapi import APIRouter

from src.app.api.routes import (
    healthcheck,
    login,
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
