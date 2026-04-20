"""poe and routes

Revision ID: 2a0b7ef5f0d1
Revises: 6ef68d97dbd6
Create Date: 2026-04-13 00:00:00.000000

"""
from collections.abc import Sequence

import sqlalchemy as sa
import sqlmodel
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "2a0b7ef5f0d1"
down_revision: str | Sequence[str] | None = "6ef68d97dbd6"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "poes",
        sa.Column("city_id", sqlmodel.sql.sqltypes.AutoString(length=64), nullable=False),
        sa.Column("title", sqlmodel.sql.sqltypes.AutoString(length=255), nullable=False),
        sa.Column("description", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("category", sqlmodel.sql.sqltypes.AutoString(length=64), nullable=False),
        sa.Column("tags", sa.JSON(), nullable=True),
        sa.Column("lat", sa.Float(), nullable=False),
        sa.Column("lng", sa.Float(), nullable=False),
        sa.Column("address", sqlmodel.sql.sqltypes.AutoString(length=512), nullable=True),
        sa.Column("wheelchair_accessible", sa.Boolean(), nullable=False),
        sa.Column("has_ramp", sa.Boolean(), nullable=False),
        sa.Column("has_stairs", sa.Boolean(), nullable=False),
        sa.Column("rating", sa.Float(), nullable=False),
        sa.Column("reviews_count", sa.Integer(), nullable=False),
        sa.Column("duration_minutes", sa.Integer(), nullable=False),
        sa.Column("images", sa.JSON(), nullable=True),
        sa.Column("opening_hours", sa.JSON(), nullable=True),
        sa.Column("id", sqlmodel.sql.sqltypes.AutoString(length=32), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_poes_category"), "poes", ["category"], unique=False)
    op.create_index(op.f("ix_poes_city_id"), "poes", ["city_id"], unique=False)
    op.create_index(op.f("ix_poes_lat"), "poes", ["lat"], unique=False)
    op.create_index(op.f("ix_poes_lng"), "poes", ["lng"], unique=False)
    op.create_index(
        op.f("ix_poes_wheelchair_accessible"),
        "poes",
        ["wheelchair_accessible"],
        unique=False,
    )

    op.create_table(
        "routes",
        sa.Column("id", sqlmodel.sql.sqltypes.AutoString(length=32), nullable=False),
        sa.Column("title", sqlmodel.sql.sqltypes.AutoString(length=255), nullable=False),
        sa.Column("description", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("city_id", sqlmodel.sql.sqltypes.AutoString(length=64), nullable=False),
        sa.Column(
            "status",
            sa.Enum("DRAFT", "SAVED", "IN_PROGRESS", "COMPLETED", "ARCHIVED", name="routestatus"),
            nullable=False,
        ),
        sa.Column("source", sa.Enum("GENERATED", "MANUAL", name="routesource"), nullable=False),
        sa.Column("duration_minutes", sa.Integer(), nullable=False),
        sa.Column("distance_meters", sa.Integer(), nullable=False),
        sa.Column("pace", sa.Enum("SLOW", "MEDIUM", "FAST", name="pace"), nullable=False),
        sa.Column("start_lat", sa.Float(), nullable=True),
        sa.Column("start_lng", sa.Float(), nullable=True),
        sa.Column("start_address", sqlmodel.sql.sqltypes.AutoString(length=512), nullable=True),
        sa.Column("accessibility_score", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_routes_city_id"), "routes", ["city_id"], unique=False)
    op.create_index(op.f("ix_routes_source"), "routes", ["source"], unique=False)
    op.create_index(op.f("ix_routes_status"), "routes", ["status"], unique=False)

    op.create_table(
        "route_points",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("route_id", sa.String(length=32), nullable=False),
        sa.Column("order", sa.Integer(), nullable=False),
        sa.Column("poe_id", sa.String(length=32), nullable=False),
        sa.Column("planned_stop_minutes", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["poe_id"], ["poes.id"]),
        sa.ForeignKeyConstraint(["route_id"], ["routes.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_route_points_order"), "route_points", ["order"], unique=False)
    op.create_index(op.f("ix_route_points_poe_id"), "route_points", ["poe_id"], unique=False)
    op.create_index(op.f("ix_route_points_route_id"), "route_points", ["route_id"], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_route_points_route_id"), table_name="route_points")
    op.drop_index(op.f("ix_route_points_poe_id"), table_name="route_points")
    op.drop_index(op.f("ix_route_points_order"), table_name="route_points")
    op.drop_table("route_points")
    op.drop_index(op.f("ix_routes_status"), table_name="routes")
    op.drop_index(op.f("ix_routes_source"), table_name="routes")
    op.drop_index(op.f("ix_routes_city_id"), table_name="routes")
    op.drop_table("routes")
    op.drop_index(op.f("ix_poes_wheelchair_accessible"), table_name="poes")
    op.drop_index(op.f("ix_poes_lng"), table_name="poes")
    op.drop_index(op.f("ix_poes_lat"), table_name="poes")
    op.drop_index(op.f("ix_poes_city_id"), table_name="poes")
    op.drop_index(op.f("ix_poes_category"), table_name="poes")
    op.drop_table("poes")
    op.execute("DROP TYPE IF EXISTS routestatus")
    op.execute("DROP TYPE IF EXISTS routesource")
    op.execute("DROP TYPE IF EXISTS pace")
