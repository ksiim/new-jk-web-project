from __future__ import annotations

import pytest
from fastapi import HTTPException

from src.app.db.models.poe import (
    PoeCreate,
    PoeModerationDecision,
    PoeTaxonomyCreate,
    PoeTaxonomyUpdate,
    PoeUpdate,
)
from src.app.service.poe import (
    PoeService,
    distance_meters,
    filter_by_bbox,
    filter_by_radius,
    filter_by_tags,
    parse_opening_hours,
    poe_to_detail,
    poe_to_public,
)


class FakePoeRepository:
    def __init__(self, poes=None, poe=None):
        self.poes = poes or []
        self.poe = poe
        self.taxonomies = []

    async def add(self, entity):
        if hasattr(entity, "type") and hasattr(entity, "value") and hasattr(entity, "status"):
            existing = await self.get_taxonomy(getattr(entity, "id", ""))
            if not existing:
                self.taxonomies.append(entity)
        return entity

    async def get_by_id(self, entity_id: str):
        if self.poe and self.poe.id == entity_id:
            return self.poe
        for item in self.poes:
            if item.id == entity_id:
                return item
        return None

    async def list_candidates(self, **kwargs):
        return self.poes

    async def list_admin_poes(self, skip, limit, status=None):
        items = self.poes
        if status is not None:
            items = [item for item in items if item.status == status]
        return items[skip : skip + limit], len(items)

    async def list_taxonomies(self, skip, limit, type_value=None, status=None):
        items = self.taxonomies
        if type_value is not None:
            items = [item for item in items if item.type == type_value]
        if status is not None:
            items = [item for item in items if item.status == status]
        return items[skip : skip + limit], len(items)

    async def get_taxonomy_by_type_and_value(self, type_value, value):
        for item in self.taxonomies:
            if item.type == type_value and item.value == value:
                return item
        return None

    async def get_taxonomy(self, taxonomy_id):
        for item in self.taxonomies:
            if item.id == taxonomy_id:
                return item
        return None


def test_distance_meters_returns_positive_value():
    assert distance_meters(59.9386, 30.3141, 59.9390, 30.3150) > 0


def test_poe_mapping_helpers(sample_poe):
    public = poe_to_public(sample_poe)
    assert public.location.address == sample_poe.address
    detail = poe_to_detail(sample_poe)
    assert detail.opening_hours[0].day == "mon"


def test_parse_opening_hours_skips_invalid_items():
    parsed = parse_opening_hours([{"day": "mon", "from": "08:00", "to": "22:00"}, {"bad": "x"}])
    assert len(parsed) == 1
    assert parsed[0].from_ == "08:00"


def test_filter_by_tags(sample_poe):
    assert filter_by_tags([sample_poe], {"coffee"}) == [sample_poe]
    assert filter_by_tags([sample_poe], {"art"}) == []


def test_filter_by_radius(sample_poe):
    filtered = filter_by_radius([sample_poe], lat=59.94, lng=30.31, radius=1000)
    assert filtered == [sample_poe]
    assert filter_by_radius([sample_poe], lat=0.0, lng=0.0, radius=1) == []


def test_filter_by_bbox(sample_poe):
    filtered = filter_by_bbox([sample_poe], "30.30,59.93,30.32,59.95")
    assert filtered == [sample_poe]


def test_filter_by_bbox_raises_for_invalid_value(sample_poe):
    with pytest.raises(HTTPException) as exc:
        filter_by_bbox([sample_poe], "bad")
    assert exc.value.status_code == 422


@pytest.mark.asyncio
async def test_create_poe_returns_detail(sample_poe):
    repository = FakePoeRepository()
    service = PoeService(repository)
    payload = PoeCreate.model_validate(sample_poe.model_dump())
    response = await service.create_poe(payload)
    assert response.data.title == sample_poe.title


@pytest.mark.asyncio
async def test_get_poe_returns_detail(sample_poe):
    repository = FakePoeRepository(poe=sample_poe)
    response = await PoeService(repository).get_poe(sample_poe.id)
    assert response.data.id == sample_poe.id


@pytest.mark.asyncio
async def test_get_poe_raises_for_missing():
    with pytest.raises(HTTPException) as exc:
        await PoeService(FakePoeRepository()).get_poe("missing")
    assert exc.value.status_code == 404


@pytest.mark.asyncio
async def test_get_poes_filters_and_paginates(sample_poe):
    repository = FakePoeRepository(poes=[sample_poe])
    response = await PoeService(repository).get_poes(
        city_id="city_spb",
        category="coffee",
        tags="coffee",
        lat=59.94,
        lng=30.31,
        radius=1000,
        wheelchair_accessible=True,
        avoid_stairs=False,
        page=1,
        limit=20,
    )
    assert response.meta.total == 1
    assert response.data[0].id == sample_poe.id


@pytest.mark.asyncio
async def test_get_map_poes_returns_map_items(sample_poe):
    repository = FakePoeRepository(poes=[sample_poe])
    response = await PoeService(repository).get_map_poes(
        city_id="city_spb",
        bbox="30.30,59.93,30.32,59.95",
        category="coffee",
        tags="coffee",
        wheelchair_accessible=True,
    )
    assert response.data[0].id == sample_poe.id
    assert response.data[0].is_accessible is True


@pytest.mark.asyncio
async def test_get_admin_poes_returns_paginated_data(sample_poe):
    repository = FakePoeRepository(poes=[sample_poe])
    response = await PoeService(repository).get_admin_poes(page=1, limit=20)
    assert response.meta.total == 1
    assert response.data[0].id == sample_poe.id


@pytest.mark.asyncio
async def test_update_poe_updates_fields(sample_poe):
    repository = FakePoeRepository(poe=sample_poe)
    response = await PoeService(repository).update_poe(
        sample_poe.id,
        PoeUpdate(title="Updated"),
    )
    assert response.data.title == "Updated"


@pytest.mark.asyncio
async def test_hide_and_delete_poe_set_status(sample_poe):
    repository = FakePoeRepository(poe=sample_poe)
    hidden = await PoeService(repository).hide_poe(sample_poe.id, PoeModerationDecision(reason="policy"))
    assert hidden.data.title == sample_poe.title
    assert repository.poe.status == "hidden"
    deleted = await PoeService(repository).delete_poe(sample_poe.id, PoeModerationDecision(reason="delete"))
    assert deleted.data.title == sample_poe.title
    assert repository.poe.status == "deleted"


@pytest.mark.asyncio
async def test_taxonomy_crud_flow():
    repository = FakePoeRepository()
    service = PoeService(repository)
    created = await service.create_taxonomy(PoeTaxonomyCreate(type="category", value="museum"))
    assert created.data.value == "museum"
    listed = await service.get_taxonomies(page=1, limit=20, type_value="category")
    assert listed.meta.total == 1
    updated = await service.update_taxonomy(created.data.id, PoeTaxonomyUpdate(value="art_museum"))
    assert updated.data.value == "art_museum"
    archived = await service.archive_taxonomy(created.data.id)
    assert archived.data.status == "archived"
