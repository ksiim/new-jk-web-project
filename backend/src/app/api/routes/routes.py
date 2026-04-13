from fastapi import APIRouter

from src.app.api.dependencies.common import RouteServiceDep
from src.app.db.models.route import RouteGenerateRequest, RouteGenerateResponse

router = APIRouter()


@router.post("/generate", response_model=RouteGenerateResponse, status_code=201)
async def generate_route(
    route_service: RouteServiceDep,
    route_in: RouteGenerateRequest,
) -> RouteGenerateResponse:
    return await route_service.generate_route(route_in)
