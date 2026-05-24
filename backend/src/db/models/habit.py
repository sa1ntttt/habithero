from datetime import datetime
from typing import Optional
from sqlalchemy import Integer, String, Boolean, DateTime, ForeignKey, JSON, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
import enum

from src.db.session import Base


class HabitType(str, enum.Enum):
    binary = "binary"        # выполнено / не выполнено
    quantity = "quantity"    # числовая цель (например, выпить 8 стаканов воды)
    timer = "timer"          # время (например, медитация 20 минут)


class Habit(Base):
    __tablename__ = "habits"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    emoji: Mapped[str] = mapped_column(String(8), default="✅")
    color: Mapped[str] = mapped_column(String(16), default="#6366f1")
    type: Mapped[HabitType] = mapped_column(SAEnum(HabitType), default=HabitType.binary)
    target_value: Mapped[Optional[float]] = mapped_column(nullable=True)
    unit: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    schedule: Mapped[dict] = mapped_column(JSON, default=lambda: {"type": "daily"})
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Optional link to a joint habit agreement (NULL = solo habit)
    joint_habit_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("joint_habits.id", ondelete="SET NULL"), nullable=True
    )

    user: Mapped["User"] = relationship("User", back_populates="habits")
    logs: Mapped[list["HabitLog"]] = relationship("HabitLog", back_populates="habit", lazy="selectin")
    streak: Mapped["Streak"] = relationship("Streak", back_populates="habit", uselist=False, lazy="selectin")
    reminders: Mapped[list["Reminder"]] = relationship("Reminder", back_populates="habit", lazy="selectin")
