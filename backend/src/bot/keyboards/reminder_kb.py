from aiogram.types import InlineKeyboardMarkup
from aiogram.utils.keyboard import InlineKeyboardBuilder

from src.db.models.reminder import Reminder
from src.services.schedule_service import WEEKDAY_NAMES_RU


# Common preset times for quick selection
PRESET_TIMES = ["07:00", "08:00", "09:00", "12:00", "18:00", "20:00", "21:00", "22:00"]


def reminder_time_presets_keyboard() -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    for t in PRESET_TIMES:
        builder.button(text=t, callback_data=f"rtime:{t}")
    builder.button(text="✏️ Свой вариант", callback_data="rtime:custom")
    builder.button(text="❌ Без напоминания", callback_data="rtime:none")
    builder.adjust(4, 4, 1, 1)
    return builder.as_markup()


def reminder_days_keyboard(selected: list[int]) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    for i, name in enumerate(WEEKDAY_NAMES_RU):
        marker = "✅" if i in selected else "⬜"
        builder.button(text=f"{marker} {name}", callback_data=f"rday:{i}")
    builder.button(text="Каждый день", callback_data="rdays:every")
    builder.button(text="Будни (Пн–Пт)", callback_data="rdays:weekdays")
    builder.button(text="✔️ Готово", callback_data="rdays:done")
    builder.adjust(7, 2, 1)
    return builder.as_markup()


def reminders_list_keyboard(reminders: list[Reminder]) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    for r in reminders:
        active = "🔔" if r.is_active else "🔕"
        time_str = r.time.strftime("%H:%M")
        days = _short_days_text(r.days_of_week)
        builder.button(
            text=f"{active} {time_str} · {days}",
            callback_data=f"rem_open:{r.id}",
        )
    builder.button(text="⬅️", callback_data="menu:main")
    builder.adjust(*([1] * (len(reminders) + 1)))
    return builder.as_markup()


def reminder_actions_keyboard(reminder: Reminder) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    toggle_text = "🔕 Выключить" if reminder.is_active else "🔔 Включить"
    builder.button(text=toggle_text, callback_data=f"rem_toggle:{reminder.id}")
    builder.button(text="🗑 Удалить", callback_data=f"rem_delete:{reminder.id}")
    builder.button(text="⬅️", callback_data="rem_back")
    builder.adjust(2, 1)
    return builder.as_markup()


def _short_days_text(days: list[int]) -> str:
    if set(days) == {0, 1, 2, 3, 4, 5, 6}:
        return "ежедневно"
    if set(days) == {0, 1, 2, 3, 4}:
        return "будни"
    if set(days) == {5, 6}:
        return "выходные"
    return ", ".join(WEEKDAY_NAMES_RU[d] for d in sorted(days))
