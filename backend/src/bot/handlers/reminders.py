from datetime import datetime
from aiogram import Router, F
from aiogram.filters import Command
from aiogram.exceptions import TelegramBadRequest
from aiogram.types import Message, CallbackQuery
from sqlalchemy.ext.asyncio import AsyncSession
import pytz

from src.bot.keyboards.reminder_kb import (
    reminders_list_keyboard,
    reminder_actions_keyboard,
    _short_days_text,
)
from src.db.repositories.user_repo import UserRepository
from src.db.repositories.habit_repo import HabitRepository
from src.db.repositories.reminder_repo import ReminderRepository
from src.db.models.habit_log import LogStatus
from src.services.streak_service import apply_checkin
from src.core.logger import get_logger

router = Router()
log = get_logger(__name__)


async def _safe_edit(callback: CallbackQuery, text: str, **kwargs) -> None:
    try:
        await callback.message.edit_text(text, **kwargs)
    except TelegramBadRequest as e:
        if "message is not modified" not in str(e):
            raise


@router.message(Command("reminders"))
async def cmd_reminders(message: Message, session: AsyncSession) -> None:
    user_repo = UserRepository(session)
    reminder_repo = ReminderRepository(session)

    user = await user_repo.get_by_telegram_id(message.from_user.id)
    if not user:
        await message.answer("❌ Сначала зарегистрируйся: /start")
        return

    reminders = await reminder_repo.list_by_user(user.id)
    if not reminders:
        await message.answer(
            "🔕 У тебя пока нет напоминаний.\n\n"
            "Напоминания добавляются при создании привычки через /new"
        )
        return

    # Load habits for displaying names
    habit_repo = HabitRepository(session)
    habits_by_id = {}
    for r in reminders:
        h = await habit_repo.get_by_id(r.habit_id, user.id)
        if h:
            habits_by_id[r.habit_id] = h

    lines = ["🔔 <b>Твои напоминания</b>\n"]
    for r in reminders:
        h = habits_by_id.get(r.habit_id)
        if not h:
            continue
        status = "🔔" if r.is_active else "🔕"
        time_str = r.time.strftime("%H:%M")
        lines.append(
            f"{status} <b>{time_str}</b> · {h.emoji} {h.name} · {_short_days_text(r.days_of_week)}"
        )

    await message.answer(
        "\n".join(lines),
        parse_mode="HTML",
        reply_markup=reminders_list_keyboard(reminders),
    )


@router.callback_query(F.data.startswith("rem_open:"))
async def open_reminder(callback: CallbackQuery, session: AsyncSession) -> None:
    reminder_id = int(callback.data.split(":")[1])
    user_repo = UserRepository(session)
    habit_repo = HabitRepository(session)
    reminder_repo = ReminderRepository(session)

    user = await user_repo.get_by_telegram_id(callback.from_user.id)
    if not user:
        await callback.answer("Ошибка")
        return

    reminder = await reminder_repo.get_by_id(reminder_id, user.id)
    if not reminder:
        await callback.answer("Напоминание не найдено")
        return

    habit = await habit_repo.get_by_id(reminder.habit_id, user.id)
    time_str = reminder.time.strftime("%H:%M")
    status = "🔔 Активно" if reminder.is_active else "🔕 Выключено"
    days = _short_days_text(reminder.days_of_week)

    text = (
        f"🔔 <b>Напоминание</b>\n\n"
        f"Привычка: {habit.emoji if habit else ''} <b>{habit.name if habit else 'удалена'}</b>\n"
        f"Время: <b>{time_str}</b>\n"
        f"Дни: {days}\n"
        f"Статус: {status}"
    )
    await _safe_edit(
        callback,
        text,
        parse_mode="HTML",
        reply_markup=reminder_actions_keyboard(reminder),
    )


@router.callback_query(F.data.startswith("rem_toggle:"))
async def toggle_reminder(callback: CallbackQuery, session: AsyncSession) -> None:
    reminder_id = int(callback.data.split(":")[1])
    user_repo = UserRepository(session)
    reminder_repo = ReminderRepository(session)

    user = await user_repo.get_by_telegram_id(callback.from_user.id)
    if not user:
        await callback.answer("Ошибка")
        return

    reminder = await reminder_repo.get_by_id(reminder_id, user.id)
    if not reminder:
        await callback.answer("Не найдено")
        return

    await reminder_repo.update(reminder, is_active=not reminder.is_active)
    await callback.answer("🔔 Включено" if reminder.is_active else "🔕 Выключено")
    # Re-render the detail view
    callback.data = f"rem_open:{reminder.id}"
    await open_reminder(callback, session)


@router.callback_query(F.data.startswith("rem_delete:"))
async def delete_reminder(callback: CallbackQuery, session: AsyncSession) -> None:
    reminder_id = int(callback.data.split(":")[1])
    user_repo = UserRepository(session)
    reminder_repo = ReminderRepository(session)

    user = await user_repo.get_by_telegram_id(callback.from_user.id)
    if not user:
        await callback.answer("Ошибка")
        return

    reminder = await reminder_repo.get_by_id(reminder_id, user.id)
    if not reminder:
        await callback.answer("Не найдено")
        return

    await reminder_repo.delete(reminder)
    await callback.answer("🗑 Напоминание удалено")
    await _safe_edit(callback, "🗑 Напоминание удалено.")


@router.callback_query(F.data == "rem_back")
async def back_to_list(callback: CallbackQuery, session: AsyncSession) -> None:
    # Re-invoke /reminders as a fake message via edit
    user_repo = UserRepository(session)
    reminder_repo = ReminderRepository(session)
    habit_repo = HabitRepository(session)

    user = await user_repo.get_by_telegram_id(callback.from_user.id)
    if not user:
        await callback.answer("Ошибка")
        return

    reminders = await reminder_repo.list_by_user(user.id)
    if not reminders:
        await _safe_edit(callback, "🔕 У тебя пока нет напоминаний.")
        return

    lines = ["🔔 <b>Твои напоминания</b>\n"]
    for r in reminders:
        h = await habit_repo.get_by_id(r.habit_id, user.id)
        if not h:
            continue
        status = "🔔" if r.is_active else "🔕"
        time_str = r.time.strftime("%H:%M")
        lines.append(
            f"{status} <b>{time_str}</b> · {h.emoji} {h.name} · {_short_days_text(r.days_of_week)}"
        )

    await _safe_edit(
        callback,
        "\n".join(lines),
        parse_mode="HTML",
        reply_markup=reminders_list_keyboard(reminders),
    )


# === Action buttons on the reminder message itself ===


@router.callback_query(F.data.startswith("rem_done:"))
async def reminder_action_done(callback: CallbackQuery, session: AsyncSession) -> None:
    habit_id = int(callback.data.split(":")[1])
    user_repo = UserRepository(session)
    habit_repo = HabitRepository(session)

    user = await user_repo.get_by_telegram_id(callback.from_user.id)
    if not user:
        await callback.answer("Ошибка")
        return

    habit = await habit_repo.get_by_id(habit_id, user.id)
    if not habit:
        await callback.answer("Привычка не найдена")
        return

    tz = pytz.timezone(user.timezone)
    today = datetime.now(tz).date()

    await habit_repo.log_done(habit_id, user.id, today)
    result = await apply_checkin(session, habit, today)

    streak_n = result.streak.current_streak
    streak_text = f"\n\n🔥 {streak_n} дней подряд!" if streak_n > 1 else ""

    await _safe_edit(
        callback,
        f"✅ <b>{habit.emoji} {habit.name}</b> — выполнено!{streak_text}",
        parse_mode="HTML",
    )
    await callback.answer("Отлично!")


@router.callback_query(F.data.startswith("rem_skip:"))
async def reminder_action_skip(callback: CallbackQuery, session: AsyncSession) -> None:
    habit_id = int(callback.data.split(":")[1])
    user_repo = UserRepository(session)
    habit_repo = HabitRepository(session)

    user = await user_repo.get_by_telegram_id(callback.from_user.id)
    if not user:
        await callback.answer("Ошибка")
        return

    habit = await habit_repo.get_by_id(habit_id, user.id)
    if not habit:
        await callback.answer("Привычка не найдена")
        return

    await _safe_edit(
        callback,
        f"🚫 {habit.emoji} {habit.name} — пропущено сегодня.\n\n"
        "Не страшно! Главное — не опускать руки. Завтра новый шанс.",
        parse_mode="HTML",
    )
    await callback.answer("Ок, не сегодня")
