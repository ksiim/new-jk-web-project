"""route journey fields

Revision ID: f1a2b3c4d5e6
Revises: e6b9c2a4d1f7
Create Date: 2026-05-02 18:10:00.000000

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "f1a2b3c4d5e6"
down_revision: str | Sequence[str] | None = "e6b9c2a4d1f7"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("routes", sa.Column("started_at", sa.DateTime(), nullable=True))
    op.add_column("routes", sa.Column("completed_at", sa.DateTime(), nullable=True))
    op.add_column(
        "routes",
        sa.Column("progress_order", sa.Integer(), nullable=False, server_default="0"),
    )
    op.alter_column("routes", "progress_order", server_default=None)


def downgrade() -> None:
    op.drop_column("routes", "progress_order")
    op.drop_column("routes", "completed_at")
    op.drop_column("routes", "started_at")
