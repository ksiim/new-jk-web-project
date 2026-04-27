"""booking idempotency key

Revision ID: 4d67b9c2e8a0
Revises: 3c4f8a91b7d2
Create Date: 2026-04-20 00:00:00.000000

"""
from collections.abc import Sequence

import sqlalchemy as sa
import sqlmodel
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "4d67b9c2e8a0"
down_revision: str | Sequence[str] | None = "3c4f8a91b7d2"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "bookings",
        sa.Column(
            "idempotency_key",
            sqlmodel.sql.sqltypes.AutoString(length=128),
            nullable=True,
        ),
    )
    op.create_unique_constraint(
        "uq_bookings_user_idempotency_key",
        "bookings",
        ["user_id", "idempotency_key"],
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint(
        "uq_bookings_user_idempotency_key",
        "bookings",
        type_="unique",
    )
    op.drop_column("bookings", "idempotency_key")
