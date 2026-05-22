"""Telegram Stars payment handlers.

When the Mini App calls `tg.openInvoice(link)`, Telegram triggers two events on the bot:
1. pre_checkout_query — we must answer with ok=True to allow the charge
2. message.successful_payment — we extend paid_until + log the payment
"""
from aiogram import Router, F
from aiogram.types import Message, PreCheckoutQuery
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.config import settings
from src.core.logger import get_logger
from src.db.repositories.user_repo import UserRepository
from src.services.payment_service import apply_successful_payment, get_plan

router = Router()
log = get_logger(__name__)


@router.pre_checkout_query()
async def on_pre_checkout(query: PreCheckoutQuery) -> None:
    """Approve the payment intent. We always say yes — payloads we don't
    recognize will fail in the successful_payment handler, but Telegram
    requires this answer within 10 seconds."""
    payload = query.invoice_payload
    plan_code = payload.split(":", 1)[0] if ":" in payload else ""
    if get_plan(plan_code) is None:
        await query.answer(ok=False, error_message="Тариф не найден")
        log.warning("pre_checkout rejected — unknown plan", payload=payload)
        return
    await query.answer(ok=True)


@router.message(F.successful_payment)
async def on_successful_payment(message: Message, session: AsyncSession) -> None:
    payment = message.successful_payment
    if payment is None:
        return

    payload = payment.invoice_payload  # "month:42" / "lifetime:42"
    try:
        plan_code, user_id_str = payload.split(":", 1)
        user_id = int(user_id_str)
    except (ValueError, AttributeError):
        log.error("successful_payment with malformed payload", payload=payload)
        await message.answer(
            "⚠️ Оплата получена, но не удалось определить тариф.\n"
            "Свяжись с поддержкой, мы вручную активируем доступ."
        )
        return

    plan = get_plan(plan_code)
    if plan is None:
        log.error("successful_payment for unknown plan", plan_code=plan_code)
        await message.answer(
            "⚠️ Оплата получена, но тариф не распознан. Свяжись с поддержкой."
        )
        return

    repo = UserRepository(session)
    user = await repo.get_by_id(user_id)
    if user is None:
        log.error("successful_payment for unknown user", user_id=user_id)
        return

    await apply_successful_payment(
        session=session,
        user=user,
        plan=plan,
        telegram_payment_charge_id=payment.telegram_payment_charge_id,
    )

    log.info(
        "subscription activated",
        user_id=user.id,
        plan=plan.code,
        stars=plan.stars,
        paid_until=user.paid_until.isoformat() if user.paid_until else None,
    )

    if plan.code == "lifetime":
        msg = (
            "🎉 <b>Доступ навсегда активирован!</b>\n\n"
            "Спасибо! Теперь HabitHero твой без ограничений.\n\n"
            f"Возвращайся в приложение: {settings.miniapp_url}"
        )
    else:
        until = user.paid_until.strftime("%d.%m.%Y") if user.paid_until else "—"
        msg = (
            "🎉 <b>Подписка активирована!</b>\n\n"
            f"Доступ открыт до <b>{until}</b>.\n\n"
            f"Возвращайся в приложение: {settings.miniapp_url}"
        )

    await message.answer(msg, parse_mode="HTML")
