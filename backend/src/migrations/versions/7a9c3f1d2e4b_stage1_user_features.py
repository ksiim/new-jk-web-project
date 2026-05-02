"""stage1 user features

Revision ID: 7a9c3f1d2e4b
Revises: 5b1f2d6e3a91
Create Date: 2026-04-28 00:00:00.000000

"""
from collections.abc import Sequence

import sqlalchemy as sa
import sqlmodel
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "7a9c3f1d2e4b"
down_revision: str | Sequence[str] | None = "5b1f2d6e3a91"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column("routes", sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=True))
    op.create_index(op.f("ix_routes_user_id"), "routes", ["user_id"], unique=False)
    op.create_foreign_key(None, "routes", "users", ["user_id"], ["id"])

    op.create_table(
        "user_preferences",
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("interests", sa.JSON(), nullable=True),
        sa.Column(
            "pace",
            sa.Enum("SLOW", "MEDIUM", "FAST", name="preferencepace"),
            nullable=False,
        ),
        sa.Column(
            "budget_level",
            sa.Enum("LOW", "MEDIUM", "HIGH", name="budgetlevel"),
            nullable=False,
        ),
        sa.Column("wheelchair_required", sa.Boolean(), nullable=False),
        sa.Column("avoid_stairs", sa.Boolean(), nullable=False),
        sa.Column("need_rest_points", sa.Boolean(), nullable=False),
        sa.Column("with_children", sa.Boolean(), nullable=False),
        sa.Column("audio_preferred", sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("user_id"),
    )

    op.create_table(
        "favorites",
        sa.Column("id", sqlmodel.sql.sqltypes.AutoString(length=32), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "entity_type",
            sa.Enum("TOUR", "ROUTE", "POE", name="favoriteentitytype"),
            nullable=False,
        ),
        sa.Column("entity_id", sqlmodel.sql.sqltypes.AutoString(length=32), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "entity_type", "entity_id", name="uq_favorites_user_entity"),
    )
    op.create_index(op.f("ix_favorites_entity_id"), "favorites", ["entity_id"], unique=False)
    op.create_index(op.f("ix_favorites_entity_type"), "favorites", ["entity_type"], unique=False)
    op.create_index(op.f("ix_favorites_user_id"), "favorites", ["user_id"], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_favorites_user_id"), table_name="favorites")
    op.drop_index(op.f("ix_favorites_entity_type"), table_name="favorites")
    op.drop_index(op.f("ix_favorites_entity_id"), table_name="favorites")
    op.drop_table("favorites")
    op.drop_table("user_preferences")
    op.drop_constraint(None, "routes", type_="foreignkey")
    op.drop_index(op.f("ix_routes_user_id"), table_name="routes")
    op.drop_column("routes", "user_id")
    op.execute("DROP TYPE IF EXISTS favoriteentitytype")
    op.execute("DROP TYPE IF EXISTS budgetlevel")
    op.execute("DROP TYPE IF EXISTS preferencepace")
