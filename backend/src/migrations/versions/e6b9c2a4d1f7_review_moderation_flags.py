"""review moderation flags

Revision ID: e6b9c2a4d1f7
Revises: d4f7a1c9b2e6
Create Date: 2026-05-02 17:45:00.000000

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "e6b9c2a4d1f7"
down_revision: str | Sequence[str] | None = "d4f7a1c9b2e6"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "reviews",
        sa.Column("hidden", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.add_column(
        "reviews",
        sa.Column("suspicious", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.add_column(
        "reviews",
        sa.Column("reported_count", sa.Integer(), nullable=False, server_default="0"),
    )
    op.create_index(op.f("ix_reviews_hidden"), "reviews", ["hidden"], unique=False)
    op.create_index(op.f("ix_reviews_suspicious"), "reviews", ["suspicious"], unique=False)
    op.alter_column("reviews", "hidden", server_default=None)
    op.alter_column("reviews", "suspicious", server_default=None)
    op.alter_column("reviews", "reported_count", server_default=None)


def downgrade() -> None:
    op.drop_index(op.f("ix_reviews_suspicious"), table_name="reviews")
    op.drop_index(op.f("ix_reviews_hidden"), table_name="reviews")
    op.drop_column("reviews", "reported_count")
    op.drop_column("reviews", "suspicious")
    op.drop_column("reviews", "hidden")
