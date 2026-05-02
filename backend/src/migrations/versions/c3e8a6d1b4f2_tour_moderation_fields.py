"""tour moderation fields

Revision ID: c3e8a6d1b4f2
Revises: b7c2d4e1f9a3
Create Date: 2026-05-02 17:05:00.000000

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "c3e8a6d1b4f2"
down_revision: str | Sequence[str] | None = "b7c2d4e1f9a3"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("tours", sa.Column("moderation_reason", sa.String(length=1024), nullable=True))
    op.add_column("tours", sa.Column("moderated_at", sa.DateTime(), nullable=True))
    op.add_column("tours", sa.Column("moderated_by", postgresql.UUID(as_uuid=True), nullable=True))
    op.create_foreign_key(None, "tours", "users", ["moderated_by"], ["id"])


def downgrade() -> None:
    op.drop_constraint(None, "tours", type_="foreignkey")
    op.drop_column("tours", "moderated_by")
    op.drop_column("tours", "moderated_at")
    op.drop_column("tours", "moderation_reason")
