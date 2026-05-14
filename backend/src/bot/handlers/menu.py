from datetime import datetime
from aiogram import Router, F
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery
from aiogram.exceptions import TelegramBadRequest
from sqlalchemy.ext.asyncio import AsyncSession
import pytz

from aiogram.utils.keyboard import InlineKeyboardBuilder
from src.bot.keyboards.habit_kb import today_habits_keyboard, main_menu_keyboard
from src.bot.states.habit_states import NewHabitStates
from src.db.repositories.user_repo import UserRepository
from src.db.repositories.habit_repo import HabitRepository
from src.db.models.habit_log import LogStatus
from src.services.schedule_service import is_scheduled_for_date

router = Router()


async def _safe_edit(callback: CallbackQuery, text: str, **kwargs) -> None:
    try:
        await callback.message.edit_text(text, **kwargs)
    except TelegramBadRequest as e:
        if "message is not modified" not in str(e):
            raise


def back_to_menu_kb():
    builder = InlineKeyboardBuilder()
    builder.button(text="⬅️", callback_data="menu:main")
    return builder.as_markup()


@router.callback_query(F.data == "menu:main")
async def menu_main(callback: CallbackQuery, state: FSMContext, session: AsyncSession) -> None:
    await state.clear()
    from src.core.config import settings
    user_repo = UserRepository(session)
    user = await user_repo.get_by_telegram_id(callback.from_user.id)
    if not user:
        await callback.answer("Сначала /start", show_alert=True)
        return

    await _safe_edit(
        callback,
        f"👋 С возвращением, <b>{user.first_name}</b>!\n\nЧем займёмся?",
        parse_mode="HTML",
        reply_markup=main_menu_keyboard(settings.miniapp_url),
    )


@router.callback_query(F.data == "menu:today")
async def menu_today(callback: CallbackQuery, session: AsyncSession) -> None:
    user_repo = UserRepository(session)
    habit_repo = HabitRepository(session)

    user = await user_repo.get_by_telegram_id(callback.from_user.id)
    if not user:
        await callback.answer("Сначала /start", show_alert=True)
        return

    tz = pytz.timezone(user.timezone)
    now = datetime.now(tz)
    today = now.date()

    all_habits = await habit_repo.get_active_by_user(user.id)
    habits = [h for h in all_habits if is_scheduled_for_date(h, today)]

    if not habits:
        await _safe_edit(
            callback,
            "На сегодня нет запланированных привычек.\n\nСоздай новую: /new",
        )
        return

    logs = {}
    for h in habits:
        log_entry = await habit_repo.get_log_for_date(h.id, today)
        if log_entry:
            logs[h.id] = log_entry

    done_count = sum(1 for l in logs.values() if l.status == LogStatus.done)
    total = len(habits)
    filled = round(done_count / total * 5) if total else 0
    bar = "█" * filled + "░" * (5 - filled)
    date_str = now.strftime("%d %B %Y").lstrip("0")

    await _safe_edit(
        callback,
        f"📅 <b>{date_str}</b>\n\n"
        f"Прогресс: {bar} {done_count}/{total}\n\n"
        "Нажми на привычку чтобы отметить выполнение:",
        parse_mode="HTML",
        reply_markup=today_habits_keyboard(habits, logs),
    )


@router.callback_query(F.data == "menu:stats")
async def menu_stats(callback: CallbackQuery, session: AsyncSession) -> None:
    from src.bot.handlers.stats import build_stats_list_view
    await build_stats_list_view(callback, session)


@router.callback_query(F.data == "menu:new")
async def menu_new(callback: CallbackQuery, state: FSMContext) -> None:
    await state.clear()
    await state.set_state(NewHabitStates.waiting_for_name)
    await _safe_edit(
        callback,
        "➕ <b>Создание новой привычки</b>\n\n"
        "Шаг 1 из 4: Как назовём привычку?\n\n"
        "Примеры: <i>Утренняя зарядка</i>, <i>Читать 30 минут</i>, <i>Выпить воду</i>",
        parse_mode="HTML",
    )


@router.callback_query(F.data == "menu:settings")
async def menu_settings(callback: CallbackQuery) -> None:
    await _safe_edit(
        callback,
        "⚙️ <b>Настройки</b>\n\n"
        "Здесь скоро появятся:\n"
        "• Смена таймзоны\n"
        "• Управление приватностью\n"
        "• Импорт/экспорт данных\n"
        "• Удаление аккаунта (GDPR)\n\n"
        "Пока что — это в разработке. 🛠",
        parse_mode="HTML",
        reply_markup=back_to_menu_kb(),
    )
