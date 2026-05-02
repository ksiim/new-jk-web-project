"""tour status

Revision ID: 8b0d1e2f3a4c
Revises: 7a9c3f1d2e4b
Create Date: 2026-05-02 00:00:00.000000

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "8b0d1e2f3a4c"
down_revision: str | Sequence[str] | None = "7a9c3f1d2e4b"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    tourstatus = sa.Enum("DRAFT", "MODERATION", "PUBLISHED", "HIDDEN", name="tourstatus")
    tourstatus.create(op.get_bind(), checkfirst=True)
    op.add_column("tours", sa.Column("status", tourstatus, nullable=False, server_default="DRAFT"))
    op.create_index(op.f("ix_tours_status"), "tours", ["status"], unique=False)
    op.alter_column("tours", "status", server_default=None)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_tours_status"), table_name="tours")
    op.drop_column("tours", "status")
    op.execute("DROP TYPE IF EXISTS tourstatus")
