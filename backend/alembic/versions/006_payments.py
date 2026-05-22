"""payments + paid_until on users

Revision ID: 006
Revises: 005
Create Date: 2026-05-22

Adds Telegram Stars payment support:
- users.paid_until: when the paid subscription expires (NULL = no paid sub)
- payments table: log of every successful Stars transaction
- Grants lifetime (paid_until = 2099-12-31) to all users that exist
  at the moment of migration ("founders get free").
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "006"
down_revision: Union[str, None] = "005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add paid_until column to users
    op.add_column(
        "users",
        sa.Column("paid_until", sa.DateTime(timezone=True), nullable=True),
    )

    # Grant lifetime access to all existing users (founders)
    op.execute(
        "UPDATE users SET paid_until = '2099-12-31 00:00:00+00' WHERE paid_until IS NULL"
    )

    # Payments log table
    op.create_table(
        "payments",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column(
            "user_id",
            sa.Integer,
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "telegram_payment_charge_id",
            sa.String(128),
            nullable=True,
            unique=True,
        ),
        sa.Column("stars", sa.Integer, nullable=False),
        sa.Column("plan", sa.String(32), nullable=False),  # "month" | "lifetime"
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
    )
    op.create_index("ix_payments_user_id", "payments", ["user_id"])
    op.create_index(
        "ix_payments_created_at", "payments", ["created_at"]
    )


def downgrade() -> None:
    op.drop_index("ix_payments_created_at", table_name="payments")
    op.drop_index("ix_payments_user_id", table_name="payments")
    op.drop_table("payments")
    op.drop_column("users", "paid_until")
