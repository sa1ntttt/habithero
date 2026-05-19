from aiogram import Router, F
from aiogram.filters import CommandStart, CommandObject
from aiogram.fsm.context import FSMContext
from aiogram.types import Message, CallbackQuery
from sqlalchemy.ext.asyncio import AsyncSession
import pytz

from src.bot.keyboards.timezone_kb import timezone_keyboard, confirm_timezone_keyboard
from src.bot.states.habit_states import TimezoneStates
from src.db.repositories.user_repo import UserRepository
from src.services.friendship_service import accept_invitation_by_user_id
from src.core.logger import get_logger

router = Router()
log = get_logger(__name__)


@router.message(CommandStart())
async def cmd_start(
    message: Message,
    command: CommandObject,
    session: AsyncSession,
    state: FSMContext,
) -> None:
    repo = UserRepository(session)
    user, is_new = await repo.get_or_create(
        telegram_id=message.from_user.id,
        first_name=message.from_user.first_name,
        username=message.from_user.username,
    )

    # Handle deep-link friend invitation: /start friend_<user_id>
    args = (command.args or "").strip()
    if args.startswith("friend_"):
        try:
            inviter_user_id = int(args.removeprefix("friend_"))
        except ValueError:
            inviter_user_id = None
        if inviter_user_id:
            ok, msg, _inviter = await accept_invitation_by_user_id(
                session, user, inviter_user_id
            )
            await message.answer(msg, parse_mode="HTML")
            if ok and not is_new:
                # Show menu for existing user
                from src.bot.keyboards.habit_kb import main_menu_keyboard
                from src.core.config import settings
                await message.answer(
                    "Чем займёмся?",
                    parse_mode="HTML",
                    reply_markup=main_menu_keyboard(settings.miniapp_url),
                )
                return

    if is_new:
        log.info("new user registered", telegram_id=message.from_user.id)
        await message.answer(
            f"👋 Привет, <b>{message.from_user.first_name}</b>!\n\n"
            "Я <b>HabitHero</b> — твой личный трекер привычек.\n\n"
            "Для начала выбери свой часовой пояс, чтобы напоминания приходили вовремя:",
            parse_mode="HTML",
            reply_markup=timezone_keyboard(),
        )
    else:
        from src.bot.keyboards.habit_kb import main_menu_keyboard
        from src.core.config import settings
        await message.answer(
            f"👋 С возвращением, <b>{message.from_user.first_name}</b>!\n\n"
            "Чем займёмся?",
            parse_mode="HTML",
            reply_markup=main_menu_keyboard(settings.miniapp_url),
        )


@router.callback_query(F.data.startswith("tz:"))
async def select_timezone(callback: CallbackQuery, session: AsyncSession, state: FSMContext) -> None:
    tz_value = callback.data.split(":", 1)[1]

    if tz_value == "back":
        await callback.message.edit_text(
            "Выбери свой часовой пояс:",
            reply_markup=timezone_keyboard(),
        )
        await state.clear()
        return

    if tz_value == "manual":
        await callback.message.edit_text(
            "✏️ Введи название таймзоны вручную.\n\n"
            "Примеры: <code>Europe/Moscow</code>, <code>Asia/Almaty</code>, <code>America/New_York</code>\n\n"
            "Полный список: en.wikipedia.org/wiki/List_of_tz_database_time_zones",
            parse_mode="HTML",
        )
        await state.set_state(TimezoneStates.waiting_for_manual_input)
        return

    await callback.message.edit_text(
        f"Твой часовой пояс: <b>{tz_value}</b>\n\nВсё верно?",
        parse_mode="HTML",
        reply_markup=confirm_timezone_keyboard(tz_value),
    )


@router.message(TimezoneStates.waiting_for_manual_input)
async def handle_manual_timezone(message: Message, session: AsyncSession, state: FSMContext) -> None:
    tz_input = message.text.strip()
    try:
        pytz.timezone(tz_input)
    except pytz.exceptions.UnknownTimeZoneError:
        await message.answer(
            f"❌ Таймзона <code>{tz_input}</code> не найдена.\n\n"
            "Попробуй ещё раз или выбери из списка /start",
            parse_mode="HTML",
        )
        return

    await message.answer(
        f"Твой часовой пояс: <b>{tz_input}</b>\n\nВсё верно?",
        parse_mode="HTML",
        reply_markup=confirm_timezone_keyboard(tz_input),
    )
    await state.clear()


@router.callback_query(F.data.startswith("tz_confirm:"))
async def confirm_timezone(callback: CallbackQuery, session: AsyncSession, state: FSMContext) -> None:
    tz_value = callback.data.split(":", 1)[1]
    repo = UserRepository(session)
    user = await repo.get_by_telegram_id(callback.from_user.id)

    if not user:
        await callback.answer("Ошибка: пользователь не найден. Попробуй /start")
        return

    await repo.update_timezone(user, tz_value)
    log.info("timezone set", telegram_id=callback.from_user.id, timezone=tz_value)

    await callback.message.edit_text(
        f"✅ Отлично! Часовой пояс <b>{tz_value}</b> сохранён.\n\n"
        "Теперь давай создадим первую привычку! Используй команду /new\n\n"
        "Или посмотри что умею: /help",
        parse_mode="HTML",
    )
