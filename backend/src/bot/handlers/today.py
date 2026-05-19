from datetime import datetime
from aiogram import Router, F
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.types import Message, CallbackQuery
from aiogram.exceptions import TelegramBadRequest
from sqlalchemy.ext.asyncio import AsyncSession
import pytz

from src.bot.keyboards.habit_kb import today_habits_keyboard, quantity_increment_keyboard
from src.bot.states.habit_states import NewHabitStates
from src.db.repositories.user_repo import UserRepository
from src.db.repositories.habit_repo import HabitRepository
from src.db.models.habit import HabitType
from src.db.models.habit_log import LogStatus
from src.services.schedule_service import is_scheduled_for_date
from src.services.streak_service import apply_checkin
from src.core.logger import get_logger

router = Router()
log = get_logger(__name__)


def _get_user_date(timezone: str) -> datetime:
    tz = pytz.timezone(timezone)
    return datetime.now(tz)


async def _build_today_view(session: AsyncSession, user, today_date):
    habit_repo = HabitRepository(session)
    all_habits = await habit_repo.get_active_by_user(user.id)
    habits = [h for h in all_habits if is_scheduled_for_date(h, today_date)]

    logs = {}
    for habit in habits:
        log_entry = await habit_repo.get_log_for_date(habit.id, today_date)
        if log_entry:
            logs[habit.id] = log_entry

    return habits, logs


def _render_today_text(now: datetime, habits, logs) -> str:
    done_count = sum(1 for l in logs.values() if l.status == LogStatus.done)
    total = len(habits)
    progress_bar = _make_progress_bar(done_count, total)
    date_str = now.strftime("%d %B %Y").lstrip("0")
    return (
        f"📅 <b>{date_str}</b>\n\n"
        f"Прогресс: {progress_bar} {done_count}/{total}\n\n"
        "Нажми на привычку чтобы отметить выполнение:"
    )


async def _refresh_today_message(callback: CallbackQuery, session: AsyncSession, user) -> None:
    now = _get_user_date(user.timezone)
    today = now.date()
    habits, logs = await _build_today_view(session, user, today)
    try:
        await callback.message.edit_text(
            _render_today_text(now, habits, logs),
            parse_mode="HTML",
            reply_markup=today_habits_keyboard(habits, logs),
        )
    except TelegramBadRequest as e:
        if "message is not modified" not in str(e):
            raise


@router.message(Command("today"))
async def cmd_today(message: Message, session: AsyncSession) -> None:
    user_repo = UserRepository(session)
    user = await user_repo.get_by_telegram_id(message.from_user.id)
    if not user:
        await message.answer("❌ Сначала зарегистрируйся: /start")
        return

    now = _get_user_date(user.timezone)
    today = now.date()
    habits, logs = await _build_today_view(session, user, today)

    if not habits:
        await message.answer(
            "На сегодня нет запланированных привычек.\n\n"
            "Создай новую: /new"
        )
        return

    await message.answer(
        _render_today_text(now, habits, logs),
        parse_mode="HTML",
        reply_markup=today_habits_keyboard(habits, logs),
    )


@router.callback_query(F.data.startswith("checkin:"))
async def handle_checkin(callback: CallbackQuery, session: AsyncSession) -> None:
    habit_id = int(callback.data.split(":")[1])
    user_repo = UserRepository(session)
    habit_repo = HabitRepository(session)

    user = await user_repo.get_by_telegram_id(callback.from_user.id)
    if not user:
        await callback.answer("Ошибка: пользователь не найден")
        return

    habit = await habit_repo.get_by_id(habit_id, user.id)
    if not habit:
        await callback.answer("Привычка не найдена")
        return

    now = _get_user_date(user.timezone)
    today = now.date()

    existing_log = await habit_repo.get_log_for_date(habit_id, today)
    already_done = existing_log and existing_log.status == LogStatus.done

    await habit_repo.log_done(habit_id, user.id, today)

    streak_result = None
    if not already_done:
        streak_result = await apply_checkin(session, habit, today)
        log.info("habit checked in", user_id=user.id, habit_id=habit_id, streak=streak_result.streak.current_streak)

    await session.refresh(habit)
    await _refresh_today_message(callback, session, user)

    if streak_result and streak_result.streak_grew:
        streak_n = streak_result.streak.current_streak
        if streak_result.freezes_used > 0:
            text = f"❄️ Заморозка использована (-{streak_result.freezes_used}). 🔥{streak_n} день подряд!"
        elif streak_n == 1:
            text = f"✅ {habit.emoji} {habit.name} — выполнено!"
        else:
            text = f"🔥 {streak_n} дней подряд! Так держать!"
        await callback.answer(text, show_alert=False)
    else:
        await callback.answer(f"✅ {habit.emoji} {habit.name}")


# ───────── Quantity habit handlers ─────────


@router.callback_query(F.data.startswith("qopen:"))
async def open_quantity_habit(callback: CallbackQuery, session: AsyncSession) -> None:
    """Open the +/- panel for a quantity habit."""
    habit_id = int(callback.data.split(":")[1])
    user_repo = UserRepository(session)
    habit_repo = HabitRepository(session)

    user = await user_repo.get_by_telegram_id(callback.from_user.id)
    if not user:
        return await callback.answer("Ошибка")

    habit = await habit_repo.get_by_id(habit_id, user.id)
    if not habit:
        return await callback.answer("Привычка не найдена")

    now = _get_user_date(user.timezone)
    today = now.date()
    log_entry = await habit_repo.get_log_for_date(habit_id, today)
    current = log_entry.value if log_entry and log_entry.value else 0
    target = habit.target_value or 0
    unit = habit.unit or ""
    done = log_entry and log_entry.status == LogStatus.done

    icon = "✅" if done else "📊"
    text = (
        f"{icon} <b>{habit.emoji} {habit.name}</b>\n\n"
        f"Сегодня: <b>{_fmt(current)} / {_fmt(target)} {unit}</b>\n"
        + ("🎉 Цель достигнута!" if done else "Добавь прогресс:")
    )
    try:
        await callback.message.edit_text(
            text,
            parse_mode="HTML",
            reply_markup=quantity_increment_keyboard(habit_id, habit.target_value, is_timer=habit.type == HabitType.timer),
        )
    except TelegramBadRequest as e:
        if "message is not modified" not in str(e):
            raise
    await callback.answer()


@router.callback_query(F.data.startswith("qty:"))
async def increment_quantity(callback: CallbackQuery, session: AsyncSession) -> None:
    """Increment value by a fixed amount."""
    parts = callback.data.split(":")
    habit_id = int(parts[1])
    increment = float(parts[2])

    user_repo = UserRepository(session)
    habit_repo = HabitRepository(session)
    user = await user_repo.get_by_telegram_id(callback.from_user.id)
    if not user:
        return await callback.answer("Ошибка")
    habit = await habit_repo.get_by_id(habit_id, user.id)
    if not habit:
        return await callback.answer("Привычка не найдена")

    await _do_increment(callback, session, user, habit, increment)


@router.callback_query(F.data.startswith("qtyc:"))
async def custom_quantity_prompt(callback: CallbackQuery, state: FSMContext) -> None:
    """Ask user to type a custom value."""
    habit_id = int(callback.data.split(":")[1])
    await state.update_data(quantity_habit_id=habit_id, quantity_message_id=callback.message.message_id)
    await state.set_state(NewHabitStates.waiting_for_quantity_custom)
    await callback.message.answer("Введи число (например, 3 или 2.5):")
    await callback.answer()


@router.message(NewHabitStates.waiting_for_quantity_custom)
async def custom_quantity_input(message: Message, state: FSMContext, session: AsyncSession) -> None:
    raw = message.text.strip().replace(",", ".")
    try:
        increment = float(raw)
    except ValueError:
        await message.answer("Это не число. Попробуй ещё раз или /cancel.")
        return

    data = await state.get_data()
    habit_id = data.get("quantity_habit_id")
    await state.clear()

    user_repo = UserRepository(session)
    habit_repo = HabitRepository(session)
    user = await user_repo.get_by_telegram_id(message.from_user.id)
    habit = await habit_repo.get_by_id(habit_id, user.id)
    if not habit:
        await message.answer("Привычка не найдена.")
        return

    # Apply increment via direct call (no callback context)
    now = _get_user_date(user.timezone)
    today = now.date()
    log_entry, became_done = await habit_repo.log_value(
        habit_id, user.id, today, increment, habit.target_value
    )

    streak_result = None
    if became_done:
        streak_result = await apply_checkin(session, habit, today)

    await message.answer(
        f"📊 Добавлено: +{_fmt(increment)} {habit.unit or ''}\n"
        f"Текущий прогресс: {_fmt(log_entry.value)} / {_fmt(habit.target_value)} {habit.unit or ''}"
        + ("\n🎉 Цель достигнута!" if became_done else ""),
    )

    if streak_result and streak_result.streak_grew:
        streak_n = streak_result.streak.current_streak
        await message.answer(f"🔥 {streak_n} дней подряд!")


@router.callback_query(F.data.startswith("qtyr:"))
async def reset_quantity(callback: CallbackQuery, session: AsyncSession) -> None:
    """Reset today's progress to 0."""
    habit_id = int(callback.data.split(":")[1])
    user_repo = UserRepository(session)
    habit_repo = HabitRepository(session)
    user = await user_repo.get_by_telegram_id(callback.from_user.id)
    if not user:
        return await callback.answer("Ошибка")

    now = _get_user_date(user.timezone)
    today = now.date()
    await habit_repo.reset_today_log(habit_id, today)

    habit = await habit_repo.get_by_id(habit_id, user.id)
    text = (
        f"📊 <b>{habit.emoji} {habit.name}</b>\n\n"
        f"Сегодня: <b>0 / {_fmt(habit.target_value)} {habit.unit or ''}</b>\n"
        "Прогресс сброшен."
    )
    try:
        await callback.message.edit_text(
            text,
            parse_mode="HTML",
            reply_markup=quantity_increment_keyboard(habit_id, habit.target_value, is_timer=habit.type == HabitType.timer),
        )
    except TelegramBadRequest as e:
        if "message is not modified" not in str(e):
            raise
    await callback.answer("Сброшено")


async def _do_increment(callback: CallbackQuery, session: AsyncSession, user, habit, increment: float) -> None:
    now = _get_user_date(user.timezone)
    today = now.date()
    habit_repo = HabitRepository(session)

    log_entry, became_done = await habit_repo.log_value(
        habit.id, user.id, today, increment, habit.target_value
    )

    streak_result = None
    if became_done:
        streak_result = await apply_checkin(session, habit, today)

    current = log_entry.value or 0
    target = habit.target_value or 0
    unit = habit.unit or ""
    done = log_entry.status == LogStatus.done
    icon = "✅" if done else "📊"

    text = (
        f"{icon} <b>{habit.emoji} {habit.name}</b>\n\n"
        f"Сегодня: <b>{_fmt(current)} / {_fmt(target)} {unit}</b>"
    )
    if done:
        text += "\n🎉 Цель достигнута!"

    try:
        await callback.message.edit_text(
            text,
            parse_mode="HTML",
            reply_markup=quantity_increment_keyboard(habit.id, habit.target_value, is_timer=habit.type == HabitType.timer),
        )
    except TelegramBadRequest as e:
        if "message is not modified" not in str(e):
            raise

    if streak_result and streak_result.streak_grew:
        streak_n = streak_result.streak.current_streak
        await callback.answer(f"🎉 Готово! 🔥 {streak_n} дней подряд!")
    else:
        await callback.answer(f"+{_fmt(increment)} {unit}")


def _fmt(value) -> str:
    """Format a numeric value: drop trailing .0 if integer."""
    if value is None:
        return "0"
    try:
        f = float(value)
        if f == int(f):
            return str(int(f))
        return f"{f:.1f}"
    except (ValueError, TypeError):
        return str(value)


def _make_progress_bar(done: int, total: int) -> str:
    if total == 0:
        return "░░░░░"
    filled = round(done / total * 5)
    return "█" * filled + "░" * (5 - filled)
