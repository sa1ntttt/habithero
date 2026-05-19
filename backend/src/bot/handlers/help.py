from aiogram import Router
from aiogram.filters import Command
from aiogram.types import Message

router = Router()


HELP_TEXT = (
    "🤖 <b>HabitHero — помощник</b>\n\n"
    "<b>Команды:</b>\n"
    "/start — приветствие и настройка таймзоны\n"
    "/new — создать новую привычку\n"
    "/today — привычки на сегодня + чек-ин\n"
    "/stats — статистика по привычке\n"
    "/reminders — управление напоминаниями\n"
    "/invite — пригласить друга\n"
    "/friends — список друзей\n"
    "/app — открыть Mini App (графики, удобный UI)\n"
    "/help — это сообщение\n\n"
    "<b>Что я умею:</b>\n"
    "• Бинарные и количественные привычки\n"
    "• Гибкое расписание (каждый день / по дням / X раз в неделю / каждые N дней)\n"
    "• 🔥 Стрики и ❄️ заморозки\n"
    "• ⭐ Уровни и XP, 🏆 20+ достижений\n"
    "• 👥 Друзья и лента активности\n"
    "• 🔔 Напоминания с учётом таймзоны\n"
)


@router.message(Command("help"))
async def cmd_help(message: Message) -> None:
    await message.answer(HELP_TEXT, parse_mode="HTML")
