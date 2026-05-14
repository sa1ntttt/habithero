from datetime import date
from typing import Optional
from sqlalchemy import Integer, Date, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.db.session import Base


class Streak(Base):
    __tablename__ = "streaks"

    habit_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("habits.id", ondelete="CASCADE"),
        primary_key=True,
    )
    current_streak: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    longest_streak: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_check_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    freezes_available: Mapped[int] = mapped_column(Integer, default=2, nullable=False)

    habit: Mapped["Habit"] = relationship("Habit", back_populates="streak")
