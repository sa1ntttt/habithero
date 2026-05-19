from aiogram import Router, F
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.types import Message, CallbackQuery
from sqlalchemy.ext.asyncio import AsyncSession

from datetime import time as time_type
from src.bot.keyboards.habit_kb import emoji_keyboard, habit_type_keyboard, timer_target_keyboard
from src.bot.keyboards.schedule_kb import (
    schedule_type_keyboard,
    weekdays_keyboard,
    times_per_week_keyboard,
    every_n_days_keyboard,
)
from src.bot.keyboards.reminder_kb import (
    reminder_time_presets_keyboard,
    reminder_days_keyboard,
    _short_days_text,
)
from src.bot.states.habit_states import NewHabitStates
from src.db.repositories.habit_repo import HabitRepository
from src.db.repositories.user_repo import UserRepository
from src.db.repositories.reminder_repo import ReminderRepository
from src.db.models.habit import HabitType
from src.services.schedule_service import schedule_human_text
from src.core.logger import get_logger

router = Router()
log = get_logger(__name__)

MAX_NAME_LENGTH = 64
MAX_DESC_LENGTH = 256


@router.message(Command("new"))
async def cmd_new_habit(message: Message, state: FSMContext) -> None:
    await state.clear()
    await state.set_state(NewHabitStates.waiting_for_name)
    await message.answer(
        "➕ <b>Создание новой привычки</b>\n\n"
        "Шаг 1 из 4: Как назовём привычку?\n\n"
        "Примеры: <i>Утренняя зарядка</i>, <i>Читать 30 минут</i>, <i>Выпить воду</i>",
        parse_mode="HTML",
    )


@router.message(NewHabitStates.waiting_for_name)
async def handle_habit_name(message: Message, state: FSMContext) -> None:
    name = message.text.strip()

    if len(name) < 2:
        await message.answer("❌ Название слишком короткое. Минимум 2 символа.")
        return

    if len(name) > MAX_NAME_LENGTH:
        await message.answer(f"❌ Название слишком длинное. Максимум {MAX_NAME_LENGTH} символов.")
        return

    await state.update_data(name=name)
    await state.set_state(NewHabitStates.waiting_for_emoji)
    await message.answer(
        f"✏️ Привычка: <b>{name}</b>\n\n"
        "Шаг 2 из 4: Выбери эмодзи:",
        parse_mode="HTML",
        reply_markup=emoji_keyboard(),
    )


@router.callback_query(NewHabitStates.waiting_for_emoji, F.data.startswith("emoji:"))
async def handle_emoji_choice(callback: CallbackQuery, state: FSMContext) -> None:
    emoji_value = callback.data.split(":", 1)[1]

    if emoji_value == "custom":
        await state.set_state(NewHabitStates.waiting_for_custom_emoji)
        await callback.message.edit_text("✏️ Отправь свой эмодзи одним сообщением:")
        return

    await state.update_data(emoji=emoji_value)
    await _ask_type(callback.message, state, edit=True)


@router.message(NewHabitStates.waiting_for_custom_emoji)
async def handle_custom_emoji(message: Message, state: FSMContext) -> None:
    emoji = message.text.strip()
    await state.update_data(emoji=emoji)
    await _ask_type(message, state, edit=False)


async def _ask_type(message: Message, state: FSMContext, edit: bool) -> None:
    data = await state.get_data()
    await state.set_state(NewHabitStates.waiting_for_type)
    text = (
        f"{data.get('emoji', '✅')} <b>{data['name']}</b>\n\n"
        "Шаг 3: Какой тип привычки?\n\n"
        "<b>Бинарная</b> — выполнил или нет (зарядка, утренний душ)\n"
        "<b>Количественная</b> — с целью (8 стаканов воды, 30 страниц)"
    )
    if edit:
        await message.edit_text(text, parse_mode="HTML", reply_markup=habit_type_keyboard())
    else:
        await message.answer(text, parse_mode="HTML", reply_markup=habit_type_keyboard())


@router.callback_query(NewHabitStates.waiting_for_type, F.data.startswith("type:"))
async def handle_type_choice(callback: CallbackQuery, state: FSMContext) -> None:
    type_value = callback.data.split(":", 1)[1]

    if type_value == "binary":
        await state.update_data(habit_type="binary")
        await _ask_schedule(callback.message, state, edit=True)
        return

    if type_value == "quantity":
        await state.update_data(habit_type="quantity")
        await state.set_state(NewHabitStates.waiting_for_target_value)
        await callback.message.edit_text(
            "📊 Какая целевая величина в день?\n\n"
            "Введи число. Например: <code>8</code> (для воды), <code>30</code> (для страниц), <code>2.5</code> (для км)",
            parse_mode="HTML",
        )
        return

    if type_value == "timer":
        await state.update_data(habit_type="timer", unit="мин")
        await state.set_state(NewHabitStates.waiting_for_target_value)
        await callback.message.edit_text(
            "⏱ Сколько минут в день — твоя цель?",
            parse_mode="HTML",
            reply_markup=timer_target_keyboard(),
        )
        return


@router.callback_query(NewHabitStates.waiting_for_target_value, F.data.startswith("tt:"))
async def handle_timer_target_preset(callback: CallbackQuery, state: FSMContext) -> None:
    value_str = callback.data.split(":", 1)[1]
    if value_str == "custom":
        await callback.message.edit_text(
            "⏱ Введи число минут (например, <code>25</code> или <code>90</code>):",
            parse_mode="HTML",
        )
        return
    try:
        minutes = float(value_str)
    except ValueError:
        await callback.answer("Ошибка")
        return
    await state.update_data(target_value=minutes)
    # Timer: unit already set, skip unit step → go straight to schedule
    await _ask_schedule(callback.message, state, edit=True)


@router.message(NewHabitStates.waiting_for_target_value)
async def handle_target_value(message: Message, state: FSMContext) -> None:
    raw = message.text.strip().replace(",", ".")
    try:
        value = float(raw)
    except ValueError:
        await message.answer("❌ Это не число. Введи целое или дробное (например, 8 или 2.5).")
        return
    if value <= 0:
        await message.answer("❌ Цель должна быть больше 0.")
        return

    await state.update_data(target_value=value)

    data = await state.get_data()
    # Timer: unit already set ("мин"), skip unit prompt
    if data.get("habit_type") == "timer":
        await _ask_schedule(message, state, edit=False)
        return

    await state.set_state(NewHabitStates.waiting_for_unit)
    await message.answer(
        "📏 В каких единицах? (одно слово)\n\n"
        "Например: <code>стаканов</code>, <code>страниц</code>, <code>км</code>, <code>раз</code>",
        parse_mode="HTML",
    )


@router.message(NewHabitStates.waiting_for_unit)
async def handle_unit(message: Message, state: FSMContext) -> None:
    unit = message.text.strip()
    if len(unit) > 32:
        await message.answer("❌ Слишком длинно. Максимум 32 символа.")
        return
    await state.update_data(unit=unit)
    await _ask_schedule(message, state, edit=False)


async def _ask_schedule(message: Message, state: FSMContext, edit: bool) -> None:
    data = await state.get_data()
    await state.set_state(NewHabitStates.waiting_for_schedule_type)
    text = (
        f"{data.get('emoji', '✅')} <b>{data['name']}</b>\n\n"
        "Шаг 3 из 4: Как часто выполнять?"
    )
    if edit:
        await message.edit_text(text, parse_mode="HTML", reply_markup=schedule_type_keyboard())
    else:
        await message.answer(text, parse_mode="HTML", reply_markup=schedule_type_keyboard())


@router.callback_query(NewHabitStates.waiting_for_schedule_type, F.data.startswith("sched:"))
async def handle_schedule_type(callback: CallbackQuery, state: FSMContext) -> None:
    stype = callback.data.split(":", 1)[1]

    if stype == "daily":
        await state.update_data(schedule={"type": "daily"})
        await _ask_description(callback.message, state, edit=True)
        return

    if stype == "weekdays":
        await state.update_data(selected_weekdays=[])
        await state.set_state(NewHabitStates.waiting_for_weekdays)
        await callback.message.edit_text(
            "📆 Выбери дни недели:",
            reply_markup=weekdays_keyboard([]),
        )
        return

    if stype == "times_per_week":
        await state.set_state(NewHabitStates.waiting_for_times_per_week)
        await callback.message.edit_text(
            "🔢 Сколько раз в неделю?",
            reply_markup=times_per_week_keyboard(),
        )
        return

    if stype == "every_n_days":
        await state.set_state(NewHabitStates.waiting_for_every_n_days)
        await callback.message.edit_text(
            "⏰ Каждые сколько дней?",
            reply_markup=every_n_days_keyboard(),
        )
        return


@router.callback_query(NewHabitStates.waiting_for_weekdays, F.data.startswith("wd_toggle:"))
async def toggle_weekday(callback: CallbackQuery, state: FSMContext) -> None:
    day = int(callback.data.split(":")[1])
    data = await state.get_data()
    selected: list[int] = list(data.get("selected_weekdays", []))
    if day in selected:
        selected.remove(day)
    else:
        selected.append(day)
    await state.update_data(selected_weekdays=selected)
    await callback.message.edit_reply_markup(reply_markup=weekdays_keyboard(selected))


@router.callback_query(NewHabitStates.waiting_for_weekdays, F.data.startswith("wd_preset:"))
async def weekday_preset(callback: CallbackQuery, state: FSMContext) -> None:
    preset = callback.data.split(":")[1]
    if preset == "weekdays":
        selected = [0, 1, 2, 3, 4]
    else:
        selected = [5, 6]
    await state.update_data(selected_weekdays=selected)
    await callback.message.edit_reply_markup(reply_markup=weekdays_keyboard(selected))


@router.callback_query(NewHabitStates.waiting_for_weekdays, F.data == "wd_done")
async def weekdays_done(callback: CallbackQuery, state: FSMContext) -> None:
    data = await state.get_data()
    selected: list[int] = list(data.get("selected_weekdays", []))
    if not selected:
        await callback.answer("Выбери хотя бы один день", show_alert=True)
        return
    await state.update_data(schedule={"type": "weekdays", "days": sorted(selected)})
    await _ask_description(callback.message, state, edit=True)


@router.callback_query(NewHabitStates.waiting_for_times_per_week, F.data.startswith("tpw:"))
async def handle_times_per_week(callback: CallbackQuery, state: FSMContext) -> None:
    n = int(callback.data.split(":")[1])
    await state.update_data(schedule={"type": "times_per_week", "count": n})
    await _ask_description(callback.message, state, edit=True)


@router.callback_query(NewHabitStates.waiting_for_every_n_days, F.data.startswith("end:"))
async def handle_every_n_days(callback: CallbackQuery, state: FSMContext) -> None:
    n = int(callback.data.split(":")[1])
    await state.update_data(schedule={"type": "every_n_days", "n": n})
    await _ask_description(callback.message, state, edit=True)


async def _ask_description(message: Message, state: FSMContext, edit: bool) -> None:
    data = await state.get_data()
    sched_text = schedule_human_text(data["schedule"])
    await state.set_state(NewHabitStates.waiting_for_description)
    text = (
        f"{data.get('emoji', '✅')} <b>{data['name']}</b>\n"
        f"⏱ {sched_text}\n\n"
        "Шаг 4 из 4: Добавь описание (необязательно).\n"
        "Отправь текст или нажми /skip чтобы пропустить."
    )
    if edit:
        await message.edit_text(text, parse_mode="HTML")
    else:
        await message.answer(text, parse_mode="HTML")


@router.message(NewHabitStates.waiting_for_description, Command("skip"))
async def skip_description(message: Message, state: FSMContext, session: AsyncSession) -> None:
    await _create_habit(message, state, session, description=None)


@router.message(NewHabitStates.waiting_for_description)
async def handle_description(message: Message, state: FSMContext, session: AsyncSession) -> None:
    description = message.text.strip()
    if len(description) > MAX_DESC_LENGTH:
        await message.answer(f"❌ Описание слишком длинное. Максимум {MAX_DESC_LENGTH} символов.")
        return
    await _create_habit(message, state, session, description=description)


async def _create_habit(message: Message, state: FSMContext, session: AsyncSession, description) -> None:
    data = await state.get_data()
    user_repo = UserRepository(session)
    habit_repo = HabitRepository(session)

    user = await user_repo.get_by_telegram_id(message.from_user.id)
    if not user:
        await message.answer("❌ Ошибка: пользователь не найден. Попробуй /start")
        await state.clear()
        return

    type_str = data.get("habit_type", "binary")
    if type_str == "quantity":
        habit_type = HabitType.quantity
    elif type_str == "timer":
        habit_type = HabitType.timer
    else:
        habit_type = HabitType.binary

    has_target = habit_type in (HabitType.quantity, HabitType.timer)
    habit = await habit_repo.create(
        user_id=user.id,
        name=data["name"],
        emoji=data.get("emoji", "✅"),
        description=description,
        habit_type=habit_type,
        schedule=data.get("schedule", {"type": "daily"}),
        target_value=data.get("target_value") if has_target else None,
        unit=data.get("unit") if has_target else None,
    )

    log.info("habit created", user_id=user.id, habit_id=habit.id, name=habit.name, type=type_str)

    sched_text = schedule_human_text(habit.schedule)
    desc_line = f"📝 {description}\n" if description else ""
    target_line = ""
    if habit.type == HabitType.quantity:
        target_line = f"🎯 Цель: {habit.target_value} {habit.unit or ''}\n"
    elif habit.type == HabitType.timer:
        target_line = f"⏱ Цель: {habit.target_value} мин в день\n"

    # Save habit_id and proceed to reminder step
    await state.update_data(created_habit_id=habit.id)
    await state.set_state(NewHabitStates.waiting_for_reminder_time)

    await message.answer(
        f"🎉 Привычка создана!\n\n"
        f"{habit.emoji} <b>{habit.name}</b>\n"
        f"{target_line}"
        f"⏱ {sched_text}\n"
        f"{desc_line}\n"
        "🔔 Хочешь напоминание? Выбери время или пропусти:",
        parse_mode="HTML",
        reply_markup=reminder_time_presets_keyboard(),
    )


def _parse_time(text: str) -> time_type | None:
    text = text.strip().replace(".", ":")
    parts = text.split(":")
    if len(parts) != 2:
        return None
    try:
        hh = int(parts[0])
        mm = int(parts[1])
        if not (0 <= hh < 24 and 0 <= mm < 60):
            return None
        return time_type(hh, mm)
    except ValueError:
        return None


@router.callback_query(NewHabitStates.waiting_for_reminder_time, F.data.startswith("rtime:"))
async def handle_reminder_time(callback: CallbackQuery, state: FSMContext, session: AsyncSession) -> None:
    value = callback.data.split(":", 1)[1]

    if value == "none":
        # Finish without reminder
        data = await state.get_data()
        habit_id = data.get("created_habit_id")
        await state.clear()
        await callback.message.edit_text(
            "Готово! Используй /today чтобы отметить выполнение сегодня.\n\n"
            f"Напоминание можно добавить позже через /reminders или в Mini App.",
        )
        return

    if value == "custom":
        await state.set_state(NewHabitStates.waiting_for_reminder_custom_time)
        await callback.message.edit_text(
            "⏰ Введи время в формате <code>ЧЧ:ММ</code>\n\nНапример: <code>07:30</code> или <code>21:00</code>",
            parse_mode="HTML",
        )
        return

    # value is "HH:MM"
    parsed = _parse_time(value)
    if not parsed:
        await callback.answer("Неверный формат времени", show_alert=True)
        return

    await state.update_data(reminder_time=value)
    await state.update_data(reminder_days=[0, 1, 2, 3, 4, 5, 6])
    await state.set_state(NewHabitStates.waiting_for_reminder_days)
    await callback.message.edit_text(
        f"⏰ Время: <b>{value}</b>\n\nВ какие дни напоминать?",
        parse_mode="HTML",
        reply_markup=reminder_days_keyboard([0, 1, 2, 3, 4, 5, 6]),
    )


@router.message(NewHabitStates.waiting_for_reminder_custom_time)
async def handle_reminder_custom_time(message: Message, state: FSMContext) -> None:
    parsed = _parse_time(message.text)
    if not parsed:
        await message.answer(
            "❌ Не понял время. Введи в формате <code>ЧЧ:ММ</code>, например <code>07:30</code>",
            parse_mode="HTML",
        )
        return

    time_str = parsed.strftime("%H:%M")
    await state.update_data(reminder_time=time_str)
    await state.update_data(reminder_days=[0, 1, 2, 3, 4, 5, 6])
    await state.set_state(NewHabitStates.waiting_for_reminder_days)
    await message.answer(
        f"⏰ Время: <b>{time_str}</b>\n\nВ какие дни напоминать?",
        parse_mode="HTML",
        reply_markup=reminder_days_keyboard([0, 1, 2, 3, 4, 5, 6]),
    )


@router.callback_query(NewHabitStates.waiting_for_reminder_days, F.data.startswith("rday:"))
async def toggle_reminder_day(callback: CallbackQuery, state: FSMContext) -> None:
    day = int(callback.data.split(":")[1])
    data = await state.get_data()
    selected: list[int] = list(data.get("reminder_days", []))
    if day in selected:
        selected.remove(day)
    else:
        selected.append(day)
    await state.update_data(reminder_days=selected)
    await callback.message.edit_reply_markup(reply_markup=reminder_days_keyboard(selected))


@router.callback_query(NewHabitStates.waiting_for_reminder_days, F.data == "rdays:every")
async def reminder_days_every(callback: CallbackQuery, state: FSMContext) -> None:
    await state.update_data(reminder_days=[0, 1, 2, 3, 4, 5, 6])
    await callback.message.edit_reply_markup(
        reply_markup=reminder_days_keyboard([0, 1, 2, 3, 4, 5, 6])
    )


@router.callback_query(NewHabitStates.waiting_for_reminder_days, F.data == "rdays:weekdays")
async def reminder_days_weekdays(callback: CallbackQuery, state: FSMContext) -> None:
    await state.update_data(reminder_days=[0, 1, 2, 3, 4])
    await callback.message.edit_reply_markup(
        reply_markup=reminder_days_keyboard([0, 1, 2, 3, 4])
    )


@router.callback_query(NewHabitStates.waiting_for_reminder_days, F.data == "rdays:done")
async def reminder_days_done(callback: CallbackQuery, state: FSMContext, session: AsyncSession) -> None:
    data = await state.get_data()
    selected: list[int] = list(data.get("reminder_days", []))
    if not selected:
        await callback.answer("Выбери хотя бы один день", show_alert=True)
        return

    time_str = data.get("reminder_time", "08:00")
    parsed = _parse_time(time_str)
    habit_id = data.get("created_habit_id")

    user_repo = UserRepository(session)
    reminder_repo = ReminderRepository(session)

    user = await user_repo.get_by_telegram_id(callback.from_user.id)
    if not user or not habit_id or not parsed:
        await callback.answer("Ошибка")
        await state.clear()
        return

    reminder = await reminder_repo.create(
        habit_id=habit_id,
        user_id=user.id,
        time_value=parsed,
        days_of_week=sorted(selected),
    )
    log.info("reminder created", user_id=user.id, reminder_id=reminder.id, habit_id=habit_id)

    await state.clear()
    await callback.message.edit_text(
        f"🔔 Напоминание установлено!\n\n"
        f"Время: <b>{time_str}</b>\n"
        f"Дни: {_short_days_text(sorted(selected))}\n\n"
        "Используй /today чтобы отметить выполнение сегодня.\n"
        "Список всех напоминаний: /reminders",
        parse_mode="HTML",
    )
