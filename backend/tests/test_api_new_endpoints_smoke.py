from __future__ import annotations

from collections.abc import Iterable

import pytest
from fastapi.testclient import TestClient

from src.app.api.dependencies.common import get_db
from src.app.main import app


@pytest.fixture(scope="module")
def client() -> Iterable[TestClient]:
    async def override_get_db() -> Iterable[object]:
        yield object()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.mark.parametrize(
    ("method", "path", "payload", "expected_statuses"),
    [
        ("GET", "/api/v1/tours/me", None, {401, 403}),
        ("PATCH", "/api/v1/tours/tour_1", {"title": "Updated"}, {401, 403, 422}),
        ("PATCH", "/api/v1/tours/tour_1/status", {"status": "published"}, {401, 403, 422}),
        (
            "PATCH",
            "/api/v1/tours/tour_1/slots/slot_1",
            {"available_capacity": 2},
            {401, 403, 422},
        ),
        ("POST", "/api/v1/tours/tour_1/slots/slot_1/close", None, {401, 403, 422}),
        ("GET", "/api/v1/guides/me", None, {401, 403}),
        ("POST", "/api/v1/guides/apply", {"payload": {"about": "test"}}, {401, 403, 422}),
        ("PATCH", "/api/v1/guides/me", {"bio": "updated"}, {401, 403, 422}),
        ("GET", "/api/v1/guides/me/bookings", None, {401, 403}),
        ("POST", "/api/v1/guides/me/bookings/booking_1/confirm", None, {401, 403, 422}),
        ("POST", "/api/v1/guides/me/bookings/booking_1/cancel", None, {401, 403, 422}),
        ("GET", "/api/v1/guides/me/stats", None, {401, 403}),
        ("GET", "/api/v1/guides/me/reviews", None, {401, 403}),
        ("GET", "/api/v1/guides/00000000-0000-0000-0000-000000000001", None, {200, 404, 422}),
        ("GET", "/api/v1/admin/users", None, {401, 403}),
        ("GET", "/api/v1/admin/guides", None, {401, 403}),
        (
            "POST",
            "/api/v1/admin/users/00000000-0000-0000-0000-000000000001/block",
            {},
            {401, 403, 422},
        ),
        (
            "POST",
            "/api/v1/admin/users/00000000-0000-0000-0000-000000000001/unblock",
            {},
            {401, 403, 422},
        ),
        ("GET", "/api/v1/admin/guides/applications", None, {401, 403}),
        ("POST", "/api/v1/admin/guides/applications/1/approve", None, {401, 403, 422}),
        ("POST", "/api/v1/admin/guides/applications/1/reject", {"reason": "test"}, {401, 403, 422}),
        ("GET", "/api/v1/admin/tours", None, {401, 403}),
        ("POST", "/api/v1/admin/tours/tour_1/approve", None, {401, 403, 422}),
        ("POST", "/api/v1/admin/tours/tour_1/hide", {"reason": "test"}, {401, 403, 422}),
        ("POST", "/api/v1/admin/tours/tour_1/reject", {"reason": "test"}, {401, 403, 422}),
        ("GET", "/api/v1/admin/poes", None, {401, 403}),
        ("PATCH", "/api/v1/admin/poes/poe_1", {"title": "Updated"}, {401, 403, 422}),
        ("POST", "/api/v1/admin/poes/poe_1/hide", {"reason": "test"}, {401, 403, 422}),
        ("POST", "/api/v1/admin/poes/poe_1/delete", None, {401, 403, 422}),
        ("GET", "/api/v1/admin/poes/taxonomy", None, {401, 403}),
        ("POST", "/api/v1/admin/poes/taxonomy", {"key": "food", "title": "Food"}, {401, 403, 422}),
        ("PATCH", "/api/v1/admin/poes/taxonomy/1", {"title": "Food+"}, {401, 403, 422}),
        ("POST", "/api/v1/admin/poes/taxonomy/1/archive", None, {401, 403, 422}),
        ("GET", "/api/v1/admin/reviews", None, {401, 403}),
        ("POST", "/api/v1/admin/reviews/review_1/hide", {"reason": "test"}, {401, 403, 422}),
        ("DELETE", "/api/v1/admin/reviews/review_1", None, {401, 403, 422}),
        ("GET", "/api/v1/admin/bookings", None, {401, 403}),
        ("POST", "/api/v1/routes/route_1/start", None, {401, 403, 422}),
        ("POST", "/api/v1/routes/route_1/progress", {"point_order": 1}, {401, 403, 422}),
        ("POST", "/api/v1/routes/route_1/finish", None, {401, 403, 422}),
        ("GET", "/api/v1/routes/history", None, {401, 403, 422}),
        ("PATCH", "/api/v1/routes/route_1", {"name": "New route"}, {401, 403, 422}),
        ("GET", "/api/v1/notifications", None, {401, 403}),
        ("POST", "/api/v1/notifications/1/read", None, {401, 403, 422}),
        ("DELETE", "/api/v1/reviews/me/review_1", None, {401, 403, 422}),
    ],
)
def test_new_endpoints_smoke(
    client: TestClient,
    method: str,
    path: str,
    payload: dict | None,
    expected_statuses: set[int],
) -> None:
    response = client.request(method=method, url=path, json=payload)
    assert response.status_code in expected_statuses, (
        f"Unexpected status for {method} {path}: "
        f"{response.status_code}, body={response.text}"
    )
