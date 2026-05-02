"""fk ondelete cascade

Revision ID: b1c2d3e4f5a6
Revises: a9b8c7d6e5f4
Create Date: 2026-05-02 18:10:00.000000

"""
from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "b1c2d3e4f5a6"
down_revision: str | Sequence[str] | None = "a9b8c7d6e5f4"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

UPGRADE_SQL = [
    (
        "bookings",
        "bookings_user_id_fkey",
        "FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE",
    ),
    (
        "bookings",
        "bookings_tour_id_fkey",
        "FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE",
    ),
    (
        "bookings",
        "bookings_slot_id_fkey",
        "FOREIGN KEY (slot_id) REFERENCES tour_slots(id) ON DELETE CASCADE",
    ),
    (
        "favorites",
        "favorites_user_id_fkey",
        "FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE",
    ),
    (
        "reviews",
        "reviews_user_id_fkey",
        "FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE",
    ),
    (
        "reviews",
        "reviews_booking_id_fkey",
        "FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL",
    ),
    (
        "user_preferences",
        "user_preferences_user_id_fkey",
        "FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE",
    ),
    (
        "guide_profiles",
        "guide_profiles_user_id_fkey",
        "FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE",
    ),
    (
        "guide_applications",
        "guide_applications_user_id_fkey",
        "FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE",
    ),
    (
        "guide_applications",
        "guide_applications_reviewed_by_fkey",
        "FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL",
    ),
    (
        "notifications",
        "notifications_user_id_fkey",
        "FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE",
    ),
    (
        "users",
        "users_blocked_by_fkey",
        "FOREIGN KEY (blocked_by) REFERENCES users(id) ON DELETE SET NULL",
    ),
    (
        "routes",
        "routes_user_id_fkey",
        "FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE",
    ),
    (
        "tours",
        "tours_moderated_by_fkey",
        "FOREIGN KEY (moderated_by) REFERENCES users(id) ON DELETE SET NULL",
    ),
]

DOWNGRADE_SQL = [
    ("bookings", "bookings_user_id_fkey", "FOREIGN KEY (user_id) REFERENCES users(id)"),
    ("bookings", "bookings_tour_id_fkey", "FOREIGN KEY (tour_id) REFERENCES tours(id)"),
    ("bookings", "bookings_slot_id_fkey", "FOREIGN KEY (slot_id) REFERENCES tour_slots(id)"),
    ("favorites", "favorites_user_id_fkey", "FOREIGN KEY (user_id) REFERENCES users(id)"),
    ("reviews", "reviews_user_id_fkey", "FOREIGN KEY (user_id) REFERENCES users(id)"),
    ("reviews", "reviews_booking_id_fkey", "FOREIGN KEY (booking_id) REFERENCES bookings(id)"),
    (
        "user_preferences",
        "user_preferences_user_id_fkey",
        "FOREIGN KEY (user_id) REFERENCES users(id)",
    ),
    (
        "guide_profiles",
        "guide_profiles_user_id_fkey",
        "FOREIGN KEY (user_id) REFERENCES users(id)",
    ),
    (
        "guide_applications",
        "guide_applications_user_id_fkey",
        "FOREIGN KEY (user_id) REFERENCES users(id)",
    ),
    (
        "guide_applications",
        "guide_applications_reviewed_by_fkey",
        "FOREIGN KEY (reviewed_by) REFERENCES users(id)",
    ),
    (
        "notifications",
        "notifications_user_id_fkey",
        "FOREIGN KEY (user_id) REFERENCES users(id)",
    ),
    ("users", "users_blocked_by_fkey", "FOREIGN KEY (blocked_by) REFERENCES users(id)"),
    ("routes", "routes_user_id_fkey", "FOREIGN KEY (user_id) REFERENCES users(id)"),
    (
        "tours",
        "tours_moderated_by_fkey",
        "FOREIGN KEY (moderated_by) REFERENCES users(id)",
    ),
]


def _apply(definitions: list[tuple[str, str, str]]) -> None:
    for table, constraint, body in definitions:
        op.execute(f"ALTER TABLE {table} DROP CONSTRAINT IF EXISTS {constraint}")
        op.execute(f"ALTER TABLE {table} ADD CONSTRAINT {constraint} {body}")


def upgrade() -> None:
    _apply(UPGRADE_SQL)


def downgrade() -> None:
    _apply(DOWNGRADE_SQL)
