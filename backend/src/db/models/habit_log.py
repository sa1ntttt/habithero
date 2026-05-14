from datetime import datetime, date
from typing import Optional
from sqlalchemy import Integer, Date, DateTime, ForeignKey, String, Float, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
import enum

from src.db.session import Base


class LogStatus(str, enum.Enum):
    done = "done"
    skipped = "skipped"
    failed = "failed"


class HabitLog(Base):
    __tablename__ = "habit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    habit_id: Mapped[int] = mapped_column(Integer, ForeignKey("habits.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    log_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    value: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    status: Mapped[LogStatus] = mapped_column(SAEnum(LogStatus), default=LogStatus.done)
    note: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    habit: Mapped["Habit"] = relationship("Habit", back_populates="logs")
