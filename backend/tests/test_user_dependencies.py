from __future__ import annotations

from types import SimpleNamespace

import pytest
from fastapi import HTTPException

from src.app.api.dependencies.users import get_current_admin, get_current_guide_or_admin
from src.app.db.models.user import Role


@pytest.mark.asyncio
async def test_get_current_admin_allows_admin() -> None:
    current_user = SimpleNamespace(role=Role.ADMIN)
    result = await get_current_admin(current_user=current_user)
    assert result is current_user


@pytest.mark.asyncio
async def test_get_current_admin_forbids_non_admin() -> None:
    current_user = SimpleNamespace(role=Role.TOURIST)
    with pytest.raises(HTTPException) as exc:
        await get_current_admin(current_user=current_user)
    assert exc.value.status_code == 403


@pytest.mark.asyncio
@pytest.mark.parametrize("role", [Role.GUIDE, Role.ADMIN])
async def test_get_current_guide_or_admin_allows_required_roles(role: Role) -> None:
    current_user = SimpleNamespace(role=role)
    result = await get_current_guide_or_admin(current_user=current_user)
    assert result is current_user


@pytest.mark.asyncio
async def test_get_current_guide_or_admin_forbids_tourist() -> None:
    current_user = SimpleNamespace(role=Role.TOURIST)
    with pytest.raises(HTTPException) as exc:
        await get_current_guide_or_admin(current_user=current_user)
    assert exc.value.status_code == 403
