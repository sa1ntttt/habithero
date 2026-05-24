"""joint habits

Revision ID: 007
Revises: 006
Create Date: 2026-05-23

Adds the "joint habits" feature: two friends doing the same habit together.

- joint_habits table holds the agreement (name, emoji, schedule, members, status)
- habits.joint_habit_id links each user's personal habit to the agreement
- Strict shared streak: a day counts only if BOTH check in
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "007"
down_revision: Union[str, None] = "006"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "joint_habits",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("name", sa.String(128), nullable=False),
        sa.Column("emoji", sa.String(8), nullable=False, server_default="✅"),
        sa.Column("color", sa.String(16), nullable=True),
        sa.Column(
            "schedule",
            sa.JSON,
            nullable=False,
            server_default=sa.text("'{\"type\":\"daily\"}'"),
        ),
        sa.Column(
            "creator_id",
            sa.Integer,
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "partner_id",
            sa.Integer,
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        # pending | active | declined | ended
        sa.Column(
            "status",
            sa.String(16),
            nullable=False,
            server_default="pending",
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
        sa.Column("accepted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("ended_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index(
        "ix_joint_habits_creator_id", "joint_habits", ["creator_id"]
    )
    op.create_index(
        "ix_joint_habits_partner_id", "joint_habits", ["partner_id"]
    )
    op.create_index("ix_joint_habits_status", "joint_habits", ["status"])

    # Link a regular habit row to the joint agreement it belongs to
    op.add_column(
        "habits",
        sa.Column(
            "joint_habit_id",
            sa.Integer,
            sa.ForeignKey("joint_habits.id", ondelete="SET NULL"),
            nullable=True,
        ),
    )
    op.create_index(
        "ix_habits_joint_habit_id", "habits", ["joint_habit_id"]
    )


def downgrade() -> None:
    op.drop_index("ix_habits_joint_habit_id", table_name="habits")
    op.drop_column("habits", "joint_habit_id")
    op.drop_index("ix_joint_habits_status", table_name="joint_habits")
    op.drop_index("ix_joint_habits_partner_id", table_name="joint_habits")
    op.drop_index("ix_joint_habits_creator_id", table_name="joint_habits")
    op.drop_table("joint_habits")
