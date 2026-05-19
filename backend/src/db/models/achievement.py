from datetime import datetime
from typing import Optional
from sqlalchemy import Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from src.db.session import Base


class Achievement(Base):
    __tablename__ = "achievements"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    code: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    description: Mapped[str] = mapped_column(String(256), nullable=False)
    icon: Mapped[str] = mapped_column(String(8), nullable=False, default="🏆")
    xp_reward: Mapped[int] = mapped_column(Integer, nullable=False, default=10)
    category: Mapped[str] = mapped_column(String(32), nullable=False, default="general")
    # requirement_type: which metric triggers it
    #   habits_created | checkins_total | streak_max | level | quantity_done | freeze_used | perfect_day
    requirement_type: Mapped[str] = mapped_column(String(32), nullable=False)
    requirement_value: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)


class UserAchievement(Base):
    __tablename__ = "user_achievements"

    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    achievement_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("achievements.id", ondelete="CASCADE"), primary_key=True
    )
    unlocked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
