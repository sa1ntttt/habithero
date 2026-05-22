from datetime import datetime
from typing import Optional

from sqlalchemy import Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from src.db.session import Base


class Payment(Base):
    """A single successful Telegram Stars payment."""

    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    telegram_payment_charge_id: Mapped[Optional[str]] = mapped_column(
        String(128), nullable=True, unique=True
    )
    stars: Mapped[int] = mapped_column(Integer, nullable=False)
    # "month" | "lifetime"
    plan: Mapped[str] = mapped_column(String(32), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
