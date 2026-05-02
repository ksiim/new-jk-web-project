"""guide profiles

Revision ID: 9f2a1c7d4b6e
Revises: 8b0d1e2f3a4c
Create Date: 2026-05-02 15:30:00.000000

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "9f2a1c7d4b6e"
down_revision: str | Sequence[str] | None = "8b0d1e2f3a4c"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "guide_profiles",
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("bio", sa.String(length=4000), nullable=False, server_default=""),
        sa.Column("specialization", sa.String(length=255), nullable=False, server_default=""),
        sa.Column("languages", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("experience", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("avatar", sa.String(length=512), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("user_id"),
    )
    op.alter_column("guide_profiles", "bio", server_default=None)
    op.alter_column("guide_profiles", "specialization", server_default=None)
    op.alter_column("guide_profiles", "languages", server_default=None)
    op.alter_column("guide_profiles", "experience", server_default=None)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table("guide_profiles")
