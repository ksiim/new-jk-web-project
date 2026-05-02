"""poe moderation taxonomy

Revision ID: d4f7a1c9b2e6
Revises: c3e8a6d1b4f2
Create Date: 2026-05-02 17:25:00.000000

"""
from collections.abc import Sequence

import sqlalchemy as sa
import sqlmodel
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "d4f7a1c9b2e6"
down_revision: str | Sequence[str] | None = "c3e8a6d1b4f2"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "poes",
        sa.Column("status", sa.String(length=32), nullable=False, server_default="active"),
    )
    op.add_column("poes", sa.Column("moderation_reason", sa.String(length=1024), nullable=True))
    op.create_index(op.f("ix_poes_status"), "poes", ["status"], unique=False)
    op.alter_column("poes", "status", server_default=None)

    op.create_table(
        "poe_taxonomies",
        sa.Column("id", sqlmodel.sql.sqltypes.AutoString(length=32), nullable=False),
        sa.Column("type", sa.String(length=32), nullable=False),
        sa.Column("value", sa.String(length=128), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_poe_taxonomies_type"), "poe_taxonomies", ["type"], unique=False)
    op.create_index(op.f("ix_poe_taxonomies_value"), "poe_taxonomies", ["value"], unique=False)
    op.create_index(op.f("ix_poe_taxonomies_status"), "poe_taxonomies", ["status"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_poe_taxonomies_status"), table_name="poe_taxonomies")
    op.drop_index(op.f("ix_poe_taxonomies_value"), table_name="poe_taxonomies")
    op.drop_index(op.f("ix_poe_taxonomies_type"), table_name="poe_taxonomies")
    op.drop_table("poe_taxonomies")
    op.drop_index(op.f("ix_poes_status"), table_name="poes")
    op.drop_column("poes", "moderation_reason")
    op.drop_column("poes", "status")
