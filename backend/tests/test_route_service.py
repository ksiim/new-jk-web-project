from __future__ import annotations

import pytest
from fastapi import HTTPException

from src.app.db.models.route import Pace
from src.app.service.route import (
    PACE_WALKING_SPEED_METERS_PER_MINUTE,
    RouteService,
)


class FakeRouteRepository:
    def __init__(self):
        self.route = None
        self.points = None

    async def create_with_points(self, route, points):
        self.route = route
        self.points = points
        return route


class FakePoeRepository:
    def __init__(self, pois):
        self.pois = pois

    async def list_candidates(self, **kwargs):
        return self.pois


def test_pace_constants_cover_all_values():
    assert PACE_WALKING_SPEED_METERS_PER_MINUTE[Pace.SLOW] < PACE_WALKING_SPEED_METERS_PER_MINUTE[Pace.FAST]


@pytest.mark.asyncio
async def test_generate_route_returns_generated_route(route_poes, route_request_factory):
    service = RouteService(FakeRouteRepository(), FakePoeRepository(route_poes))
    response = await service.generate_route(route_request_factory())
    assert response.data.id.startswith("route_")
    assert len(response.data.points) >= 1
    assert response.data.distance_meters > 0


@pytest.mark.asyncio
async def test_generate_route_raises_when_no_candidates(route_request_factory):
    service = RouteService(FakeRouteRepository(), FakePoeRepository([]))
    with pytest.raises(HTTPException) as exc:
        await service.generate_route(route_request_factory())
    assert exc.value.status_code == 404


def test_select_points_prefers_matching_interests(route_poes, route_request_factory):
    service = RouteService(FakeRouteRepository(), FakePoeRepository(route_poes))
    selected = service._select_points(route_request_factory(interests=["art"]), route_poes.copy())
    assert selected[0].category == "art"


def test_select_points_falls_back_to_candidates_when_interest_not_found(route_poes, route_request_factory):
    service = RouteService(FakeRouteRepository(), FakePoeRepository(route_poes))
    selected = service._select_points(route_request_factory(interests=["museum"]), route_poes.copy())
    assert len(selected) >= 1


def test_route_distance_is_non_negative(route_poes, route_request_factory):
    service = RouteService(FakeRouteRepository(), FakePoeRepository(route_poes))
    total = service._route_distance(route_request_factory(), route_poes[:2])
    assert total >= 0


def test_accessibility_score_handles_empty(route_poes, route_request_factory):
    service = RouteService(FakeRouteRepository(), FakePoeRepository(route_poes))
    assert service._accessibility_score([]) == 0


def test_accessibility_score_prefers_accessible_pois(route_poes, route_request_factory):
    service = RouteService(FakeRouteRepository(), FakePoeRepository(route_poes))
    score = service._accessibility_score(route_poes[:2])
    assert score >= 70


def test_build_title_with_interests(route_poes, route_request_factory):
    service = RouteService(FakeRouteRepository(), FakePoeRepository(route_poes))
    title = service._build_title(route_request_factory(interests=["coffee", "art"]), route_poes)
    assert "coffee" in title.lower()


def test_build_title_with_points_only(route_poes, route_request_factory):
    service = RouteService(FakeRouteRepository(), FakePoeRepository(route_poes))
    title = service._build_title(route_request_factory(interests=[]), route_poes)
    assert route_poes[0].category in title


def test_build_title_default_when_empty(route_request_factory):
    service = RouteService(FakeRouteRepository(), FakePoeRepository([]))
    assert service._build_title(route_request_factory(interests=[]), []) == "Новый маршрут"
