"""tours bookings

Revision ID: 3c4f8a91b7d2
Revises: 2a0b7ef5f0d1
Create Date: 2026-04-19 00:00:00.000000

"""
from collections.abc import Sequence

import sqlalchemy as sa
import sqlmodel
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "3c4f8a91b7d2"
down_revision: str | Sequence[str] | None = "2a0b7ef5f0d1"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "tours",
        sa.Column("title", sqlmodel.sql.sqltypes.AutoString(length=255), nullable=False),
        sa.Column("description", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("city_id", sqlmodel.sql.sqltypes.AutoString(length=64), nullable=False),
        sa.Column("guide_id", sqlmodel.sql.sqltypes.AutoString(length=64), nullable=False),
        sa.Column("guide_name", sqlmodel.sql.sqltypes.AutoString(length=255), nullable=False),
        sa.Column("guide_avatar_url", sqlmodel.sql.sqltypes.AutoString(length=512), nullable=True),
        sa.Column("guide_rating", sa.Float(), nullable=False),
        sa.Column("guide_reviews_count", sa.Integer(), nullable=False),
        sa.Column("guide_bio", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column(
            "format",
            sa.Enum(
                "OFFLINE_GUIDED",
                "SELF_GUIDED",
                "AUDIO_GUIDE",
                "PRIVATE_TOUR",
                "GROUP_TOUR",
                name="tourformat",
            ),
            nullable=False,
        ),
        sa.Column("language", sqlmodel.sql.sqltypes.AutoString(length=8), nullable=False),
        sa.Column("duration_minutes", sa.Integer(), nullable=False),
        sa.Column("group_size_max", sa.Integer(), nullable=False),
        sa.Column("price_amount", sa.Integer(), nullable=False),
        sa.Column("price_currency", sqlmodel.sql.sqltypes.AutoString(length=8), nullable=False),
        sa.Column("tags", sa.JSON(), nullable=True),
        sa.Column("meeting_lat", sa.Float(), nullable=False),
        sa.Column("meeting_lng", sa.Float(), nullable=False),
        sa.Column("meeting_address", sqlmodel.sql.sqltypes.AutoString(length=512), nullable=True),
        sa.Column("wheelchair_accessible", sa.Boolean(), nullable=False),
        sa.Column("avoid_stairs_possible", sa.Boolean(), nullable=False),
        sa.Column("rating", sa.Float(), nullable=False),
        sa.Column("reviews_count", sa.Integer(), nullable=False),
        sa.Column("cover_image_url", sqlmodel.sql.sqltypes.AutoString(length=512), nullable=True),
        sa.Column("images", sa.JSON(), nullable=True),
        sa.Column(
            "cancellation_policy",
            sqlmodel.sql.sqltypes.AutoString(length=64),
            nullable=False,
        ),
        sa.Column("route_distance_meters", sa.Integer(), nullable=False),
        sa.Column("route_points_count", sa.Integer(), nullable=False),
        sa.Column("id", sqlmodel.sql.sqltypes.AutoString(length=32), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_tours_city_id"), "tours", ["city_id"], unique=False)
    op.create_index(op.f("ix_tours_format"), "tours", ["format"], unique=False)
    op.create_index(op.f("ix_tours_language"), "tours", ["language"], unique=False)
    op.create_index(
        op.f("ix_tours_wheelchair_accessible"),
        "tours",
        ["wheelchair_accessible"],
        unique=False,
    )

    op.create_table(
        "tour_slots",
        sa.Column("id", sqlmodel.sql.sqltypes.AutoString(length=32), nullable=False),
        sa.Column("tour_id", sqlmodel.sql.sqltypes.AutoString(length=32), nullable=False),
        sa.Column("starts_at", sa.DateTime(), nullable=False),
        sa.Column("ends_at", sa.DateTime(), nullable=False),
        sa.Column("available_capacity", sa.Integer(), nullable=False),
        sa.Column("price_amount", sa.Integer(), nullable=False),
        sa.Column("price_currency", sqlmodel.sql.sqltypes.AutoString(length=8), nullable=False),
        sa.Column(
            "status",
            sa.Enum("AVAILABLE", "SOLD_OUT", "CANCELLED", name="slotstatus"),
            nullable=False,
        ),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["tour_id"], ["tours.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_tour_slots_starts_at"), "tour_slots", ["starts_at"], unique=False)
    op.create_index(op.f("ix_tour_slots_status"), "tour_slots", ["status"], unique=False)
    op.create_index(op.f("ix_tour_slots_tour_id"), "tour_slots", ["tour_id"], unique=False)

    op.create_table(
        "bookings",
        sa.Column("id", sqlmodel.sql.sqltypes.AutoString(length=32), nullable=False),
        sa.Column("tour_id", sqlmodel.sql.sqltypes.AutoString(length=32), nullable=False),
        sa.Column("slot_id", sqlmodel.sql.sqltypes.AutoString(length=32), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("participants_count", sa.Integer(), nullable=False),
        sa.Column(
            "status",
            sa.Enum(
                "PENDING_PAYMENT",
                "CONFIRMED",
                "CANCELLED",
                "COMPLETED",
                "REFUNDED",
                name="bookingstatus",
            ),
            nullable=False,
        ),
        sa.Column("price_total_amount", sa.Integer(), nullable=False),
        sa.Column(
            "price_total_currency",
            sqlmodel.sql.sqltypes.AutoString(length=8),
            nullable=False,
        ),
        sa.Column("payment_id", sqlmodel.sql.sqltypes.AutoString(length=32), nullable=False),
        sa.Column("payment_url", sqlmodel.sql.sqltypes.AutoString(length=512), nullable=False),
        sa.Column("contact_phone", sqlmodel.sql.sqltypes.AutoString(length=32), nullable=True),
        sa.Column("comment", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column("cancel_reason", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column(
            "refund_status",
            sa.Enum("NOT_REQUIRED", "PENDING", "REFUNDED", name="refundstatus"),
            nullable=True,
        ),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["slot_id"], ["tour_slots.id"]),
        sa.ForeignKeyConstraint(["tour_id"], ["tours.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_bookings_payment_id"), "bookings", ["payment_id"], unique=False)
    op.create_index(op.f("ix_bookings_slot_id"), "bookings", ["slot_id"], unique=False)
    op.create_index(op.f("ix_bookings_status"), "bookings", ["status"], unique=False)
    op.create_index(op.f("ix_bookings_tour_id"), "bookings", ["tour_id"], unique=False)
    op.create_index(op.f("ix_bookings_user_id"), "bookings", ["user_id"], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_bookings_user_id"), table_name="bookings")
    op.drop_index(op.f("ix_bookings_tour_id"), table_name="bookings")
    op.drop_index(op.f("ix_bookings_status"), table_name="bookings")
    op.drop_index(op.f("ix_bookings_slot_id"), table_name="bookings")
    op.drop_index(op.f("ix_bookings_payment_id"), table_name="bookings")
    op.drop_table("bookings")
    op.drop_index(op.f("ix_tour_slots_tour_id"), table_name="tour_slots")
    op.drop_index(op.f("ix_tour_slots_status"), table_name="tour_slots")
    op.drop_index(op.f("ix_tour_slots_starts_at"), table_name="tour_slots")
    op.drop_table("tour_slots")
    op.drop_index(op.f("ix_tours_wheelchair_accessible"), table_name="tours")
    op.drop_index(op.f("ix_tours_language"), table_name="tours")
    op.drop_index(op.f("ix_tours_format"), table_name="tours")
    op.drop_index(op.f("ix_tours_city_id"), table_name="tours")
    op.drop_table("tours")
    op.execute("DROP TYPE IF EXISTS refundstatus")
    op.execute("DROP TYPE IF EXISTS bookingstatus")
    op.execute("DROP TYPE IF EXISTS slotstatus")
    op.execute("DROP TYPE IF EXISTS tourformat")
