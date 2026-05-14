from aiogram import Router, F
from aiogram.filters import Command
from aiogram.exceptions import TelegramBadRequest
from aiogram.types import Message, CallbackQuery, InlineKeyboardMarkup
from aiogram.utils.keyboard import InlineKeyboardBuilder
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.repositories.user_repo import UserRepository
from src.db.repositories.habit_repo import HabitRepository
from src.db.models.habit_log import HabitLog, LogStatus
from src.services.schedule_service import schedule_human_text
from src.core.logger import get_logger

router = Router()
log = get_logger(__name__)


def _habits_list_keyboard(habits) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    for h in habits:
        streak = h.streak.current_streak if h.streak else 0
        label = f"{h.emoji} {h.name}"
        if streak > 0:
            label += f"  🔥{streak}"
        builder.button(text=label, callback_data=f"stats:{h.id}")
    builder.button(text="⬅️", callback_data="menu:main")
    builder.adjust(*([1] * (len(habits) + 1)))
    return builder.as_markup()


def _back_to_stats_kb() -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.button(text="⬅️", callback_data="menu:stats")
    return builder.as_markup()


async def _safe_edit(callback: CallbackQuery, text: str, **kwargs) -> None:
    try:
        await callback.message.edit_text(text, **kwargs)
    except TelegramBadRequest as e:
        if "message is not modified" not in str(e):
            raise


async def build_stats_list_view(callback_or_msg, session: AsyncSession) -> None:
    """Render the habit list for /stats. Works for both Message and CallbackQuery."""
    is_callback = isinstance(callback_or_msg, CallbackQuery)
    tg_user_id = callback_or_msg.from_user.id

    user_repo = UserRepository(session)
    habit_repo = HabitRepository(session)
    user = await user_repo.get_by_telegram_id(tg_user_id)

    if not user:
        text = "❌ Сначала зарегистрируйся: /start"
        if is_callback:
            await callback_or_msg.answer(text, show_alert=True)
        else:
            await callback_or_msg.answer(text)
        return

    habits = await habit_repo.get_active_by_user(user.id)
    if not habits:
        text = "У тебя пока нет привычек. Создай первую: /new"
        if is_callback:
            await _safe_edit(callback_or_msg, text)
        else:
            await callback_or_msg.answer(text)
        return

    text = "📊 <b>Выбери привычку для статистики:</b>"
    kb = _habits_list_keyboard(habits)
    if is_callback:
        await _safe_edit(callback_or_msg, text, parse_mode="HTML", reply_markup=kb)
    else:
        await callback_or_msg.answer(text, parse_mode="HTML", reply_markup=kb)


@router.message(Command("stats"))
async def cmd_stats(message: Message, session: AsyncSession) -> None:
    await build_stats_list_view(message, session)


@router.callback_query(F.data.startswith("stats:"))
async def show_habit_stats(callback: CallbackQuery, session: AsyncSession) -> None:
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

    total_done_result = await session.execute(
        select(func.count()).select_from(HabitLog).where(
            HabitLog.habit_id == habit_id,
            HabitLog.status == LogStatus.done,
        )
    )
    total_done = total_done_result.scalar_one()

    streak = habit.streak
    current = streak.current_streak if streak else 0
    longest = streak.longest_streak if streak else 0
    freezes = streak.freezes_available if streak else 2
    sched_text = schedule_human_text(habit.schedule)

    desc_block = f"\n📝 <i>{habit.description}</i>\n" if habit.description else ""

    text = (
        f"📊 <b>Статистика привычки</b>\n\n"
        f"{habit.emoji} <b>{habit.name}</b>{desc_block}\n"
        f"⏱ Расписание: {sched_text}\n\n"
        f"🔥 Текущий стрик: <b>{current}</b>\n"
        f"🏆 Рекорд: <b>{longest}</b>\n"
        f"✅ Всего выполнено: <b>{total_done}</b>\n"
        f"❄️ Заморозок осталось: <b>{freezes}</b> / 2"
    )

    await _safe_edit(callback, text, parse_mode="HTML", reply_markup=_back_to_stats_kb())
