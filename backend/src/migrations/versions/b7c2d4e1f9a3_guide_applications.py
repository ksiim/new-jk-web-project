"""guide applications

Revision ID: b7c2d4e1f9a3
Revises: a4b1d9c8e2f0
Create Date: 2026-05-02 16:50:00.000000

"""
from collections.abc import Sequence

import sqlalchemy as sa
import sqlmodel
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "b7c2d4e1f9a3"
down_revision: str | Sequence[str] | None = "a4b1d9c8e2f0"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    guideapplicationstatus = sa.Enum(
        "PENDING",
        "APPROVED",
        "REJECTED",
        name="guideapplicationstatus",
    )
    guideapplicationstatus.create(op.get_bind(), checkfirst=True)
    op.create_table(
        "guide_applications",
        sa.Column("id", sqlmodel.sql.sqltypes.AutoString(length=32), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("payload", sa.JSON(), nullable=False),
        sa.Column(
            "status",
            postgresql.ENUM(
                "PENDING",
                "APPROVED",
                "REJECTED",
                name="guideapplicationstatus",
                create_type=False,
            ),
            nullable=False,
        ),
        sa.Column("reviewed_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(), nullable=True),
        sa.Column("rejection_reason", sa.String(length=1024), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["reviewed_by"], ["users.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_guide_applications_user_id"),
        "guide_applications",
        ["user_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_guide_applications_status"),
        "guide_applications",
        ["status"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_guide_applications_status"), table_name="guide_applications")
    op.drop_index(op.f("ix_guide_applications_user_id"), table_name="guide_applications")
    op.drop_table("guide_applications")
    op.execute("DROP TYPE IF EXISTS guideapplicationstatus")
