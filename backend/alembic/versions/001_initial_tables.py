"""initial tables

Revision ID: 001
Revises:
Create Date: 2026-05-11

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("telegram_id", sa.BigInteger, nullable=False, unique=True),
        sa.Column("username", sa.String(64), nullable=True),
        sa.Column("first_name", sa.String(128), nullable=False),
        sa.Column("timezone", sa.String(64), nullable=False, server_default="Europe/Moscow"),
        sa.Column("language", sa.String(8), nullable=False, server_default="ru"),
        sa.Column("level", sa.Integer, nullable=False, server_default="1"),
        sa.Column("total_xp", sa.Integer, nullable=False, server_default="0"),
        sa.Column("settings", sa.JSON, nullable=False, server_default="{}"),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_users_telegram_id", "users", ["telegram_id"])

    op.create_table(
        "habits",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(128), nullable=False),
        sa.Column("description", sa.String(512), nullable=True),
        sa.Column("emoji", sa.String(8), nullable=False, server_default="✅"),
        sa.Column("color", sa.String(16), nullable=False, server_default="#6366f1"),
        sa.Column("type", sa.Enum("binary", "quantity", "timer", name="habittype"), nullable=False, server_default="binary"),
        sa.Column("target_value", sa.Float, nullable=True),
        sa.Column("unit", sa.String(32), nullable=True),
        sa.Column("schedule", sa.JSON, nullable=False, server_default='{"type": "daily"}'),
        sa.Column("is_archived", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_habits_user_id", "habits", ["user_id"])

    op.create_table(
        "habit_logs",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("habit_id", sa.Integer, sa.ForeignKey("habits.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("log_date", sa.Date, nullable=False),
        sa.Column("value", sa.Float, nullable=True),
        sa.Column("status", sa.Enum("done", "skipped", "failed", name="logstatus"), nullable=False, server_default="done"),
        sa.Column("note", sa.String(512), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_habit_logs_habit_id", "habit_logs", ["habit_id"])
    op.create_index("ix_habit_logs_user_id", "habit_logs", ["user_id"])
    op.create_index("ix_habit_logs_log_date", "habit_logs", ["log_date"])


def downgrade() -> None:
    op.drop_table("habit_logs")
    op.drop_table("habits")
    op.drop_table("users")
    op.execute("DROP TYPE IF EXISTS habittype")
    op.execute("DROP TYPE IF EXISTS logstatus")
