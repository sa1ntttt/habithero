import asyncio

from src.core.config import settings
from src.core.logger import setup_logging, get_logger
from src.bot.setup import create_bot_and_dispatcher
from src.scheduler.scheduler import create_scheduler

log = get_logger(__name__)


async def main() -> None:
    setup_logging()
    log.info("starting HabitHero bot (standalone)", environment=settings.environment)

    bot, dp = create_bot_and_dispatcher()

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
