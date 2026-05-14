from aiogram.types import InlineKeyboardMarkup
from aiogram.utils.keyboard import InlineKeyboardBuilder

from src.services.schedule_service import WEEKDAY_NAMES_RU


def schedule_type_keyboard() -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.button(text="📅 Каждый день", callback_data="sched:daily")
    builder.button(text="📆 По дням недели", callback_data="sched:weekdays")
    builder.button(text="🔢 X раз в неделю", callback_data="sched:times_per_week")
    builder.button(text="⏰ Каждые N дней", callback_data="sched:every_n_days")
    builder.button(text="⬅️", callback_data="menu:main")
    builder.adjust(1)
    return builder.as_markup()


def weekdays_keyboard(selected: list[int]) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    for i, name in enumerate(WEEKDAY_NAMES_RU):
        marker = "✅" if i in selected else "⬜"
        builder.button(text=f"{marker} {name}", callback_data=f"wd_toggle:{i}")
    builder.button(text="Пн–Пт (будни)", callback_data="wd_preset:weekdays")
    builder.button(text="Сб–Вс (выходные)", callback_data="wd_preset:weekends")
    builder.button(text="✔️ Готово", callback_data="wd_done")
    builder.button(text="⬅️", callback_data="menu:main")
    builder.adjust(7, 2, 1, 1)
    return builder.as_markup()


def times_per_week_keyboard() -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    for n in range(1, 8):
        builder.button(text=f"{n}×", callback_data=f"tpw:{n}")
    builder.button(text="⬅️", callback_data="menu:main")
    builder.adjust(7, 1)
    return builder.as_markup()


def every_n_days_keyboard() -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    for n in [2, 3, 4, 5, 7, 10, 14]:
        builder.button(text=f"{n} дн", callback_data=f"end:{n}")
    builder.button(text="⬅️", callback_data="menu:main")
    builder.adjust(4, 3, 1)
    return builder.as_markup()
