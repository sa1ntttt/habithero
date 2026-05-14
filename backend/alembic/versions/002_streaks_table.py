"""streaks table + backfill

Revision ID: 002
Revises: 001
Create Date: 2026-05-11

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "streaks",
        sa.Column("habit_id", sa.Integer, sa.ForeignKey("habits.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("current_streak", sa.Integer, nullable=False, server_default="0"),
        sa.Column("longest_streak", sa.Integer, nullable=False, server_default="0"),
        sa.Column("last_check_date", sa.Date, nullable=True),
        sa.Column("freezes_available", sa.Integer, nullable=False, server_default="2"),
    )

    # Backfill: create streak rows for existing habits using most recent log
    op.execute("""
        INSERT INTO streaks (habit_id, current_streak, longest_streak, last_check_date, freezes_available)
        SELECT
            h.id,
            CASE WHEN MAX(hl.log_date) IS NOT NULL THEN 1 ELSE 0 END,
            CASE WHEN MAX(hl.log_date) IS NOT NULL THEN 1 ELSE 0 END,
            MAX(hl.log_date),
            2
        FROM habits h
        LEFT JOIN habit_logs hl ON hl.habit_id = h.id AND hl.status = 'done'
        GROUP BY h.id
    """)


def downgrade() -> None:
    op.drop_table("streaks")
