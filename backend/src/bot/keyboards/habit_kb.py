from typing import Optional
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.utils.keyboard import InlineKeyboardBuilder

from src.db.models.habit import Habit, HabitType
from src.db.models.habit_log import HabitLog, LogStatus


EMOJI_OPTIONS = ["✅", "💪", "📚", "🏃", "💧", "🧘", "🎯", "🌟", "🍎", "😴"]


def emoji_keyboard() -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    for emoji in EMOJI_OPTIONS:
        builder.button(text=emoji, callback_data=f"emoji:{emoji}")
    builder.button(text="✏️ Свой эмодзи", callback_data="emoji:custom")
    builder.button(text="⬅️", callback_data="menu:main")
    builder.adjust(5, 5, 1, 1)
    return builder.as_markup()


def habit_type_keyboard() -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.button(text="✅ Бинарная (выполнил / нет)", callback_data="type:binary")
    builder.button(text="📊 Количественная (с целью)", callback_data="type:quantity")
    builder.button(text="⬅️", callback_data="menu:main")
    builder.adjust(1)
    return builder.as_markup()


def _format_habit_row(habit: Habit, log: Optional[HabitLog]) -> tuple[str, str]:
    """Return (text, callback) for a habit row in /today keyboard."""
    streak = habit.streak.current_streak if habit.streak else 0
    streak_label = f"  🔥{streak}" if streak > 0 else ""

    if habit.type == HabitType.quantity and habit.target_value:
        current = log.value if log and log.value is not None else 0
        target = habit.target_value
        unit = habit.unit or ""
        done = log and log.status == LogStatus.done
        icon = "✅" if done else "📊"
        progress = f"{int(current) if current == int(current) else current}/{int(target) if target == int(target) else target} {unit}".strip()
        text = f"{icon} {habit.emoji} {habit.name} — {progress}{streak_label}"
        callback = f"qopen:{habit.id}"
    else:
        done = log and log.status == LogStatus.done
        icon = "✅" if done else "⬜"
        text = f"{icon} {habit.emoji} {habit.name}{streak_label}"
        callback = f"checkin:{habit.id}"

    return text, callback


def today_habits_keyboard(habits: list[Habit], logs: dict[int, HabitLog]) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    for habit in habits:
        text, callback = _format_habit_row(habit, logs.get(habit.id))
        builder.button(text=text, callback_data=callback)
    builder.button(text="⬅️", callback_data="menu:main")
    builder.adjust(*([1] * len(habits)), 1)
    return builder.as_markup()


def quantity_increment_keyboard(habit_id: int, target: Optional[float]) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.button(text="+1", callback_data=f"qty:{habit_id}:1")
    if target and target >= 4:
        big_step = max(2, int(target / 4))
        builder.button(text=f"+{big_step}", callback_data=f"qty:{habit_id}:{big_step}")
    builder.button(text="✏️ Своё", callback_data=f"qtyc:{habit_id}")
    builder.button(text="🔄 Сбросить", callback_data=f"qtyr:{habit_id}")
    builder.button(text="⬅️", callback_data="menu:today")
    builder.adjust(3, 1, 1)
    return builder.as_markup()


def main_menu_keyboard(miniapp_url: str | None = None) -> InlineKeyboardMarkup:
    from aiogram.types import WebAppInfo
    builder = InlineKeyboardBuilder()
    if miniapp_url and not miniapp_url.startswith("http://localhost"):
        builder.button(
            text="🚀 Открыть приложение",
            web_app=WebAppInfo(url=miniapp_url),
        )
    builder.button(text="📋 Мои привычки сегодня", callback_data="menu:today")
    builder.button(text="➕ Новая привычка", callback_data="menu:new")
    builder.button(text="📊 Статистика", callback_data="menu:stats")
    builder.button(text="⚙️ Настройки", callback_data="menu:settings")
    builder.adjust(1)
    return builder.as_markup()
