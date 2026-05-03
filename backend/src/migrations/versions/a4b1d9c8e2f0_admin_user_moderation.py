"""admin user moderation

Revision ID: a4b1d9c8e2f0
Revises: 9f2a1c7d4b6e
Create Date: 2026-05-02 16:30:00.000000

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "a4b1d9c8e2f0"
down_revision: str | Sequence[str] | None = "9f2a1c7d4b6e"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    userstatus = sa.Enum("ACTIVE", "BLOCKED", name="userstatus")
    userstatus.create(op.get_bind(), checkfirst=True)
    op.add_column(
        "users",
        sa.Column("status", userstatus, nullable=False, server_default="ACTIVE"),
    )
    op.add_column("users", sa.Column("blocked_at", sa.DateTime(), nullable=True))
    op.add_column("users", sa.Column("blocked_by", postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column("users", sa.Column("block_reason", sa.String(length=1024), nullable=True))
    op.create_index(op.f("ix_users_status"), "users", ["status"], unique=False)
    op.create_foreign_key(None, "users", "users", ["blocked_by"], ["id"])
    op.alter_column("users", "status", server_default=None)


def downgrade() -> None:
    op.drop_constraint(None, "users", type_="foreignkey")
    op.drop_index(op.f("ix_users_status"), table_name="users")
    op.drop_column("users", "block_reason")
    op.drop_column("users", "blocked_by")
    op.drop_column("users", "blocked_at")
    op.drop_column("users", "status")
    op.execute("DROP TYPE IF EXISTS userstatus")
