from __future__ import annotations

import pytest
from fastapi import HTTPException
from types import SimpleNamespace

from src.app.db.models.guide_application import GuideApplication, GuideApplicationCreate, GuideApplicationDecision, GuideApplicationStatus
from src.app.db.models.guide_profile import GuideProfile, GuideProfileUpdate
from src.app.db.models.user import Role, UserStatus
from src.app.db.models.user_preference import BudgetLevel, PreferencePace, UserPreferencesUpdate
from src.app.service.user import UserService


class FakeUserRepository:
    def __init__(self, preferences=None, guide_profile=None):
        self.preferences = preferences
        self.guide_profile = guide_profile
        self.user = None
        self.saved_user = None
        self.users = []
        self.users_total = 0
        self.last_role = None
        self.last_status = None
        self.application = None
        self.applications = []
        self.applications_total = 0
        self.saved_user_entity = None
        self.saved_application_entity = None

    async def get_preferences(self, user_id):
        return self.preferences

    async def upsert_preferences(self, user_id, preferences_in):
        from src.app.db.models.user_preference import UserPreferences

        self.preferences = UserPreferences(
            user_id=user_id,
            interests=preferences_in.interests,
            pace=preferences_in.pace,
            budget_level=preferences_in.budget_level,
            wheelchair_required=preferences_in.accessibility.wheelchair_required,
            avoid_stairs=preferences_in.accessibility.avoid_stairs,
            need_rest_points=preferences_in.accessibility.need_rest_points,
            with_children=preferences_in.accessibility.with_children,
            audio_preferred=preferences_in.accessibility.audio_preferred,
        )
        return self.preferences

    async def get_guide_profile(self, user_id):
        return self.guide_profile

    async def upsert_guide_profile(self, user_id, profile_in):
        self.guide_profile = GuideProfile(
            user_id=user_id,
            bio=profile_in.bio,
            specialization=profile_in.specialization,
            languages=profile_in.languages,
            experience=profile_in.experience,
            avatar=profile_in.avatar,
        )
        return self.guide_profile

    async def get_user(self, **filters):
        user_id = filters.get("id")
        if self.user and user_id == self.user.id:
            return self.user
        return None

    async def add(self, user):
        if hasattr(user, "status") and hasattr(user, "payload"):
            self.saved_application_entity = user
            self.application = user
            return user
        self.saved_user = user
        self.saved_user_entity = user
        self.user = user
        return user

    async def get_users(self, skip=0, limit=20, role=None, status=None):
        self.last_role = role
        self.last_status = status
        return self.users[skip : skip + limit], self.users_total

    async def get_pending_guide_application(self, user_id):
        if self.application and self.application.user_id == user_id and self.application.status == GuideApplicationStatus.PENDING:
            return self.application
        return None

    async def create_guide_application(self, user_id, application_in):
        self.application = GuideApplication(
            id="gapp_1",
            user_id=user_id,
            payload=application_in.payload,
            status=GuideApplicationStatus.PENDING,
        )
        return self.application

    async def get_guide_application(self, application_id):
        if self.application and self.application.id == application_id:
            return self.application
        return None

    async def list_guide_applications(self, skip=0, limit=20, status=None):
        items = self.applications
        if status is not None:
            items = [item for item in items if item.status == status]
        return items[skip : skip + limit], self.applications_total


@pytest.mark.asyncio
async def test_get_preferences_returns_defaults_for_missing(sample_user):
    response = await UserService(FakeUserRepository()).get_preferences(user_id=sample_user.id)
    assert response.data.interests == []
    assert response.data.pace == PreferencePace.MEDIUM
    assert response.data.budget_level == BudgetLevel.MEDIUM


@pytest.mark.asyncio
async def test_update_preferences_persists_values(sample_user):
    service = UserService(FakeUserRepository())
    response = await service.update_preferences(
        user_id=sample_user.id,
        preferences_in=UserPreferencesUpdate.model_validate(
            {
                "interests": ["coffee", "art"],
                "pace": "slow",
                "budget_level": "high",
                "accessibility": {
                    "wheelchair_required": True,
                    "avoid_stairs": True,
                    "need_rest_points": False,
                    "with_children": True,
                    "audio_preferred": False,
                },
            },
        ),
    )
    assert response.data.interests == ["coffee", "art"]
    assert response.data.pace == PreferencePace.SLOW
    assert response.data.accessibility.with_children is True


@pytest.mark.asyncio
async def test_get_guide_profile_returns_defaults_for_missing(sample_user):
    response = await UserService(FakeUserRepository()).get_guide_profile(user_id=sample_user.id)
    assert response.data.user_id == sample_user.id
    assert response.data.bio == ""
    assert response.data.specialization == ""
    assert response.data.languages == []
    assert response.data.experience == 0
    assert response.data.avatar is None


@pytest.mark.asyncio
async def test_update_guide_profile_persists_values(sample_user):
    service = UserService(FakeUserRepository())
    response = await service.update_guide_profile(
        user_id=sample_user.id,
        profile_in=GuideProfileUpdate.model_validate(
            {
                "bio": "Local history guide",
                "specialization": "History",
                "languages": ["ru", "en"],
                "experience": 7,
                "avatar": "https://example.com/avatar.jpg",
            },
        ),
    )
    assert response.data.user_id == sample_user.id
    assert response.data.bio == "Local history guide"
    assert response.data.specialization == "History"
    assert response.data.languages == ["ru", "en"]
    assert response.data.experience == 7
    assert response.data.avatar == "https://example.com/avatar.jpg"


@pytest.mark.asyncio
async def test_get_users_passes_role_and_status_filters():
    repository = FakeUserRepository()
    repository.users = []
    repository.users_total = 0
    service = UserService(repository)

    await service.get_users(page=1, limit=20, role=Role.GUIDE, status=UserStatus.BLOCKED)

    assert repository.last_role == Role.GUIDE
    assert repository.last_status == UserStatus.BLOCKED


@pytest.mark.asyncio
async def test_block_user_sets_audit_fields(sample_user):
    repository = FakeUserRepository()
    repository.user = SimpleNamespace(
        id=sample_user.id,
        role=Role.TOURIST,
        status=UserStatus.ACTIVE,
        blocked_at=None,
        blocked_by=None,
        block_reason=None,
    )
    response = await UserService(repository).block_user(
        user_id=sample_user.id,
        admin_id=sample_user.id,
        reason="abuse",
    )
    assert response.message == "User blocked"
    assert repository.saved_user.status == UserStatus.BLOCKED
    assert repository.saved_user.blocked_by == sample_user.id
    assert repository.saved_user.block_reason == "abuse"
    assert repository.saved_user.blocked_at is not None


@pytest.mark.asyncio
async def test_block_user_rejects_admin(sample_user):
    repository = FakeUserRepository()
    repository.user = SimpleNamespace(
        id=sample_user.id,
        role=Role.ADMIN,
        status=UserStatus.ACTIVE,
        blocked_at=None,
        blocked_by=None,
        block_reason=None,
    )
    with pytest.raises(HTTPException) as exc:
        await UserService(repository).block_user(
            user_id=sample_user.id,
            admin_id=sample_user.id,
            reason=None,
        )
    assert exc.value.status_code == 409


@pytest.mark.asyncio
async def test_unblock_user_clears_audit_fields(sample_user):
    repository = FakeUserRepository()
    repository.user = SimpleNamespace(
        id=sample_user.id,
        role=Role.GUIDE,
        status=UserStatus.BLOCKED,
        blocked_at="2026-05-01T10:00:00",
        blocked_by=sample_user.id,
        block_reason="abuse",
    )
    response = await UserService(repository).unblock_user(user_id=sample_user.id)
    assert response.message == "User unblocked"
    assert repository.saved_user.status == UserStatus.ACTIVE
    assert repository.saved_user.blocked_at is None
    assert repository.saved_user.blocked_by is None
    assert repository.saved_user.block_reason is None


@pytest.mark.asyncio
async def test_apply_for_guide_creates_pending_application(sample_user):
    repository = FakeUserRepository()
    response = await UserService(repository).apply_for_guide(
        user_id=sample_user.id,
        application_in=GuideApplicationCreate(payload={"bio": "hello"}),
    )
    assert response.data.user_id == sample_user.id
    assert response.data.status == GuideApplicationStatus.PENDING


@pytest.mark.asyncio
async def test_apply_for_guide_rejects_duplicate_pending(sample_user):
    repository = FakeUserRepository()
    repository.application = GuideApplication(
        id="gapp_1",
        user_id=sample_user.id,
        payload={},
        status=GuideApplicationStatus.PENDING,
    )
    with pytest.raises(HTTPException) as exc:
        await UserService(repository).apply_for_guide(
            user_id=sample_user.id,
            application_in=GuideApplicationCreate(payload={}),
        )
    assert exc.value.status_code == 409


@pytest.mark.asyncio
async def test_get_guide_applications_returns_list_and_meta(sample_user):
    repository = FakeUserRepository()
    repository.applications = [
        GuideApplication(
            id="gapp_1",
            user_id=sample_user.id,
            payload={},
            status=GuideApplicationStatus.PENDING,
        ),
    ]
    repository.applications_total = 1
    response = await UserService(repository).get_guide_applications(page=1, limit=20)
    assert response.meta.total == 1
    assert response.data[0].id == "gapp_1"


@pytest.mark.asyncio
async def test_approve_guide_application_sets_role_and_status(sample_user):
    repository = FakeUserRepository()
    repository.application = GuideApplication(
        id="gapp_1",
        user_id=sample_user.id,
        payload={},
        status=GuideApplicationStatus.PENDING,
    )
    repository.user = SimpleNamespace(id=sample_user.id, role=Role.TOURIST)
    response = await UserService(repository).approve_guide_application(
        application_id="gapp_1",
        admin_id=sample_user.id,
    )
    assert response.data.status == GuideApplicationStatus.APPROVED
    assert repository.saved_user_entity.role == Role.GUIDE


@pytest.mark.asyncio
async def test_reject_guide_application_sets_status_and_reason(sample_user):
    repository = FakeUserRepository()
    repository.application = GuideApplication(
        id="gapp_1",
        user_id=sample_user.id,
        payload={},
        status=GuideApplicationStatus.PENDING,
    )
    response = await UserService(repository).reject_guide_application(
        application_id="gapp_1",
        admin_id=sample_user.id,
        decision_in=GuideApplicationDecision(reason="missing docs"),
    )
    assert response.data.status == GuideApplicationStatus.REJECTED
    assert response.data.rejection_reason == "missing docs"
