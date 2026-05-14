from datetime import datetime
from aiogram import Router, F
from aiogram.filters import Command
from aiogram.types import Message, CallbackQuery
from aiogram.exceptions import TelegramBadRequest
from sqlalchemy.ext.asyncio import AsyncSession
import pytz

from src.bot.keyboards.habit_kb import today_habits_keyboard
from src.db.repositories.user_repo import UserRepository
from src.db.repositories.habit_repo import HabitRepository
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


def _make_progress_bar(done: int, total: int) -> str:
    if total == 0:
        return "░░░░░"
    filled = round(done / total * 5)
    return "█" * filled + "░" * (5 - filled)
