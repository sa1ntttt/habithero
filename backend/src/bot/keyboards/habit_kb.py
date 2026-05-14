from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.utils.keyboard import InlineKeyboardBuilder

from src.db.models.habit import Habit
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


def today_habits_keyboard(habits: list[Habit], logs: dict[int, HabitLog]) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    for habit in habits:
        log = logs.get(habit.id)
        is_done = log and log.status == LogStatus.done
        status_icon = "✅" if is_done else "⬜"
        streak = habit.streak.current_streak if habit.streak else 0
        streak_label = f"  🔥{streak}" if streak > 0 else ""
        builder.button(
            text=f"{status_icon} {habit.emoji} {habit.name}{streak_label}",
            callback_data=f"checkin:{habit.id}",
        )
    builder.button(text="⬅️", callback_data="menu:main")
    builder.adjust(*([1] * len(habits)), 1)
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
