from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.utils.keyboard import InlineKeyboardBuilder

POPULAR_TIMEZONES = [
    ("🇷🇺 Москва (UTC+3)", "Europe/Moscow"),
    ("🇷🇺 Екатеринбург (UTC+5)", "Asia/Yekaterinburg"),
    ("🇷🇺 Новосибирск (UTC+7)", "Asia/Novosibirsk"),
    ("🇷🇺 Красноярск (UTC+7)", "Asia/Krasnoyarsk"),
    ("🇷🇺 Иркутск (UTC+8)", "Asia/Irkutsk"),
    ("🇷🇺 Якутск (UTC+9)", "Asia/Yakutsk"),
    ("🇷🇺 Владивосток (UTC+10)", "Asia/Vladivostok"),
    ("🇰🇿 Алматы (UTC+5)", "Asia/Almaty"),
    ("🇺🇦 Киев (UTC+2)", "Europe/Kyiv"),
    ("🇧🇾 Минск (UTC+3)", "Europe/Minsk"),
]


def timezone_keyboard() -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    for label, tz in POPULAR_TIMEZONES:
        builder.button(text=label, callback_data=f"tz:{tz}")
    builder.button(text="✏️ Ввести вручную", callback_data="tz:manual")
    builder.adjust(1)
    return builder.as_markup()


def confirm_timezone_keyboard(tz: str) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.button(text="✅ Подтвердить", callback_data=f"tz_confirm:{tz}")
    builder.button(text="🔙 Назад", callback_data="tz:back")
    builder.adjust(2)
    return builder.as_markup()
