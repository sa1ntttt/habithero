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
    "/app — открыть Mini App (графики, удобный UI)\n"
    "/help — это сообщение\n\n"
    "<b>Что я умею:</b>\n"
    "• Бинарные привычки (выполнено/нет)\n"
    "• Гибкое расписание (каждый день / по дням недели / X раз в неделю / каждые N дней)\n"
    "• 🔥 Стрики — считаю сколько дней подряд ты выполняешь привычку\n"
    "• ❄️ Заморозки — 2 в месяц, не теряешь стрик если пропустил день\n\n"
    "<b>Скоро (в разработке):</b>\n"
    "• Mini App с графиками и heatmap\n"
    "• Напоминания\n"
    "• Достижения и уровни\n"
    "• Друзья и совместные челленджи\n"
)


@router.message(Command("help"))
async def cmd_help(message: Message) -> None:
    await message.answer(HELP_TEXT, parse_mode="HTML")
