import asyncio
from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.fsm.storage.memory import MemoryStorage

from src.core.config import settings
from src.core.logger import setup_logging, get_logger
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
)
from src.scheduler.scheduler import create_scheduler

log = get_logger(__name__)


async def main() -> None:
    setup_logging()
    log.info("starting HabitHero bot", environment=settings.environment)

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
    dp.include_router(app_handler.router)
    dp.include_router(help_handler.router)

    scheduler = create_scheduler(bot)
    scheduler.start()
    log.info("scheduler started — reminders dispatcher active")

    await bot.delete_webhook(drop_pending_updates=True)
    log.info("bot started, listening for updates...")

    try:
        await dp.start_polling(bot)
    finally:
        scheduler.shutdown(wait=False)
        await bot.session.close()
        log.info("bot stopped")


if __name__ == "__main__":
    asyncio.run(main())
