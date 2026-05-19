"""Bot + Dispatcher setup, reusable by both bot_main.py (local polling) and api/app.py (combined process)."""

from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.fsm.storage.memory import MemoryStorage

from src.core.config import settings
from src.db.session import AsyncSessionFactory
from src.bot.middlewares.db_middleware import DbSessionMiddleware
from src.bot.handlers import (
    start,
    new_habit,
    today,
    help as help_handler,
    stats,
    menu,
    app as app_handler,
    reminders as reminders_handler,
    friends as friends_handler,
)


def create_bot_and_dispatcher() -> tuple[Bot, Dispatcher]:
    bot = Bot(
        token=settings.bot_token,
        default=DefaultBotProperties(parse_mode=ParseMode.HTML),
    )

    dp = Dispatcher(storage=MemoryStorage())
    dp.update.middleware(DbSessionMiddleware(session_factory=AsyncSessionFactory))

    dp.include_router(start.router)
    dp.include_router(menu.router)
    dp.include_router(new_habit.router)
    dp.include_router(today.router)
    dp.include_router(stats.router)
    dp.include_router(reminders_handler.router)
    dp.include_router(friends_handler.router)
    dp.include_router(app_handler.router)
    dp.include_router(help_handler.router)

    return bot, dp
