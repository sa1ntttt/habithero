"""Telegram Stars payments — invoices and post-payment logic.

We sell two plans:
- "month":    150 Stars, extends paid_until by 30 days
- "lifetime": 500 Stars, sets paid_until to 2099-12-31

Payment payloads have format "<plan>:<user_id>" so the successful-payment
handler can find the right user without trusting the telegram_id alone.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from dataclasses import dataclass
from typing import Optional

from aiogram import Bot
from aiogram.types import LabeledPrice
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.models.user import User
from src.db.models.payment import Payment
from src.services.access_service import LIFETIME_THRESHOLD


@dataclass(frozen=True)
class Plan:
    code: str
    title: str
    description: str
    stars: int
    days: Optional[int]  # None = lifetime


PLANS: dict[str, Plan] = {
    "month": Plan(
        code="month",
        title="HabitHero — 1 месяц",
        description="Полный доступ ко всем функциям на 30 дней",
        stars=150,
        days=30,
    ),
    "lifetime": Plan(
        code="lifetime",
        title="HabitHero — навсегда",
        description="Разовая оплата, доступ ко всем функциям без ограничений",
        stars=500,
        days=None,
    ),
}


def get_plan(code: str) -> Optional[Plan]:
    return PLANS.get(code)


async def create_stars_invoice_link(bot: Bot, user_id: int, plan: Plan) -> str:
    """Ask Telegram for a `tg://...` invoice URL that can be opened via tg.openInvoice().

    The payload encodes plan + user_id so the successful_payment handler
    knows who paid and what for.
    """
    return await bot.create_invoice_link(
        title=plan.title,
        description=plan.description,
        payload=f"{plan.code}:{user_id}",
        provider_token="",  # Stars use an empty provider_token + currency="XTR"
        currency="XTR",
        prices=[LabeledPrice(label=plan.title, amount=plan.stars)],
    )


def _as_utc(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


async def apply_successful_payment(
    session: AsyncSession,
    user: User,
    plan: Plan,
    telegram_payment_charge_id: Optional[str],
) -> User:
    """Extend the user's paid_until and log the payment.

    For "month": adds 30 days. If user already has an active paid sub
    (paid_until in the future), extends from that — so users who renew
    early don't lose days.

    For "lifetime": sets paid_until to LIFETIME_THRESHOLD unconditionally.
    """
    now = datetime.now(tz=timezone.utc)

    if plan.code == "lifetime":
        user.paid_until = LIFETIME_THRESHOLD
    else:
        # Extend from the current paid_until if it's in the future, else from now
        current = (
            _as_utc(user.paid_until)
            if user.paid_until is not None and _as_utc(user.paid_until) > now
            else now
        )
        user.paid_until = current + timedelta(days=plan.days or 30)

    payment = Payment(
        user_id=user.id,
        telegram_payment_charge_id=telegram_payment_charge_id,
        stars=plan.stars,
        plan=plan.code,
    )
    session.add(payment)
    await session.commit()
    await session.refresh(user)
    return user
