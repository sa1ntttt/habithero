from aiogram import Router
from aiogram.filters import Command
from aiogram.types import Message, InlineKeyboardMarkup, WebAppInfo
from aiogram.utils.keyboard import InlineKeyboardBuilder

from src.core.config import settings

router = Router()


def miniapp_keyboard() -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.button(
        text="🚀 Открыть приложение",
        web_app=WebAppInfo(url=settings.miniapp_url),
    )
    return builder.as_markup()


@router.message(Command("app"))
async def cmd_app(message: Message) -> None:
    if not settings.miniapp_url or settings.miniapp_url.startswith("http://localhost"):
        await message.answer(
            "⚠️ Mini App ещё не настроен.\n\n"
            "Чтобы открыть приложение, нужно указать публичный HTTPS-адрес в .env "
            "(переменная MINIAPP_URL). На локалке это делается через cloudflared/ngrok."
        )
        return

    await message.answer(
        "🚀 <b>HabitHero — приложение</b>\n\n"
        "Открой Mini App для красивых графиков, удобного создания привычек и "
        "детальной статистики.",
        parse_mode="HTML",
        reply_markup=miniapp_keyboard(),
    )
