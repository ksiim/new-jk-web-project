"""reviews and ratings

Revision ID: 5b1f2d6e3a91
Revises: 4d67b9c2e8a0
Create Date: 2026-04-27 00:00:00.000000

"""
from collections.abc import Sequence

import sqlalchemy as sa
import sqlmodel
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "5b1f2d6e3a91"
down_revision: str | Sequence[str] | None = "4d67b9c2e8a0"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "reviews",
        sa.Column("id", sqlmodel.sql.sqltypes.AutoString(length=32), nullable=False),
        sa.Column("entity_type", sa.Enum("TOUR", "POE", name="reviewentitytype"), nullable=False),
        sa.Column("entity_id", sqlmodel.sql.sqltypes.AutoString(length=32), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_name", sqlmodel.sql.sqltypes.AutoString(length=255), nullable=False),
        sa.Column("booking_id", sqlmodel.sql.sqltypes.AutoString(length=32), nullable=True),
        sa.Column("rating", sa.Integer(), nullable=False),
        sa.Column("text", sqlmodel.sql.sqltypes.AutoString(length=4000), nullable=False),
        sa.Column("accessibility_rating", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["booking_id"], ["bookings.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_reviews_booking_id"), "reviews", ["booking_id"], unique=False)
    op.create_index(op.f("ix_reviews_entity_id"), "reviews", ["entity_id"], unique=False)
    op.create_index(op.f("ix_reviews_entity_type"), "reviews", ["entity_type"], unique=False)
    op.create_index(op.f("ix_reviews_user_id"), "reviews", ["user_id"], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_reviews_user_id"), table_name="reviews")
    op.drop_index(op.f("ix_reviews_entity_type"), table_name="reviews")
    op.drop_index(op.f("ix_reviews_entity_id"), table_name="reviews")
    op.drop_index(op.f("ix_reviews_booking_id"), table_name="reviews")
    op.drop_table("reviews")
    op.execute("DROP TYPE IF EXISTS reviewentitytype")
