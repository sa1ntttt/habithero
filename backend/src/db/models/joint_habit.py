from datetime import datetime
from typing import Optional

from sqlalchemy import Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from src.db.session import Base


class JointHabit(Base):
    """A "do-it-together" agreement between two users.

    Each accepted JointHabit has two Habit rows pointing to it via
    `habits.joint_habit_id` — one for the creator, one for the partner.
    Each user checks in to their own Habit, but the shared streak only
    advances on days when BOTH users checked in.
    """

    __tablename__ = "joint_habits"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    emoji: Mapped[str] = mapped_column(String(8), default="✅")
    color: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)
    schedule: Mapped[dict] = mapped_column(JSON, default=lambda: {"type": "daily"})

    creator_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    partner_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # "pending" | "active" | "declined" | "ended"
    status: Mapped[str] = mapped_column(String(16), default="pending", index=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    accepted_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    ended_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
