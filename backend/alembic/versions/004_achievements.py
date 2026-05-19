"""achievements + user_achievements + seed data

Revision ID: 004
Revises: 003
Create Date: 2026-05-19

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "004"
down_revision: Union[str, None] = "003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


SEED_ACHIEVEMENTS = [
    # First steps
    ("first_habit", "Первый шаг", "Создай свою первую привычку", "🌱", 10, "start", "habits_created", 1, 10),
    ("first_checkin", "Поехали!", "Сделай первую отметку", "✨", 10, "start", "checkins_total", 1, 20),
    # Streaks
    ("streak_3", "Тройка", "Стрик 3 дня", "🔥", 25, "streak", "streak_max", 3, 100),
    ("streak_7", "Неделя", "Стрик 7 дней", "🔥", 50, "streak", "streak_max", 7, 110),
    ("streak_30", "Месяц!", "Стрик 30 дней", "🔥", 200, "streak", "streak_max", 30, 120),
    ("streak_100", "Сотка", "Стрик 100 дней", "🏆", 1000, "streak", "streak_max", 100, 130),
    # Total check-ins
    ("checkins_10", "Десятка", "10 отметок всего", "✅", 25, "volume", "checkins_total", 10, 200),
    ("checkins_50", "Полтинник", "50 отметок", "💯", 50, "volume", "checkins_total", 50, 210),
    ("checkins_100", "Сотня", "100 отметок", "🎯", 100, "volume", "checkins_total", 100, 220),
    ("checkins_500", "Пятисотка", "500 отметок", "🏆", 500, "volume", "checkins_total", 500, 230),
    # Habits variety
    ("habits_3", "Коллекционер", "3 активные привычки", "📚", 25, "variety", "habits_created", 3, 300),
    ("habits_5", "Пятёрка", "5 активных привычек", "📚", 50, "variety", "habits_created", 5, 310),
    ("habits_10", "Десятка", "10 активных привычек", "📚", 100, "variety", "habits_created", 10, 320),
    # Levels
    ("level_5", "Пятый уровень", "Достигни 5 уровня", "🎖️", 50, "level", "level", 5, 400),
    ("level_10", "Десятый уровень", "Достигни 10 уровня", "🏅", 100, "level", "level", 10, 410),
    ("level_20", "Магистр", "Достигни 20 уровня", "👑", 500, "level", "level", 20, 420),
    # Special
    ("quantity_done", "Цель достигнута", "Заверши количественную привычку", "🎯", 25, "special", "quantity_done", 1, 500),
    ("freeze_used", "Зимовка", "Используй заморозку стрика", "❄️", 15, "special", "freeze_used", 1, 510),
    ("perfect_day", "Идеальный день", "Выполни все привычки за день", "🌟", 30, "special", "perfect_day", 1, 520),
    ("perfect_week", "Идеальная неделя", "7 идеальных дней", "💫", 100, "special", "perfect_day", 7, 530),
]


def upgrade() -> None:
    op.create_table(
        "achievements",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("code", sa.String(64), unique=True, nullable=False),
        sa.Column("name", sa.String(128), nullable=False),
        sa.Column("description", sa.String(256), nullable=False),
        sa.Column("icon", sa.String(8), nullable=False, server_default="🏆"),
        sa.Column("xp_reward", sa.Integer, nullable=False, server_default="10"),
        sa.Column("category", sa.String(32), nullable=False, server_default="general"),
        sa.Column("requirement_type", sa.String(32), nullable=False),
        sa.Column("requirement_value", sa.Integer, nullable=False, server_default="1"),
        sa.Column("sort_order", sa.Integer, nullable=False, server_default="0"),
    )

    op.create_table(
        "user_achievements",
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("achievement_id", sa.Integer, sa.ForeignKey("achievements.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("unlocked_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Seed achievements
    conn = op.get_bind()
    for code, name, desc, icon, xp, category, req_type, req_value, order in SEED_ACHIEVEMENTS:
        conn.execute(
            sa.text(
                "INSERT INTO achievements (code, name, description, icon, xp_reward, category, requirement_type, requirement_value, sort_order) "
                "VALUES (:code, :name, :desc, :icon, :xp, :category, :req_type, :req_value, :order)"
            ),
            {
                "code": code, "name": name, "desc": desc, "icon": icon, "xp": xp,
                "category": category, "req_type": req_type, "req_value": req_value, "order": order,
            },
        )


def downgrade() -> None:
    op.drop_table("user_achievements")
    op.drop_table("achievements")
