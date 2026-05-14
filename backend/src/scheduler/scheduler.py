from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from aiogram import Bot

from src.core.logger import get_logger
from src.services.reminder_service import dispatch_due_reminders

log = get_logger(__name__)


def create_scheduler(bot: Bot) -> AsyncIOScheduler:
    scheduler = AsyncIOScheduler(timezone="UTC")

    # Run reminder dispatcher every minute, at second :05
    scheduler.add_job(
        dispatch_due_reminders,
        trigger=CronTrigger(second=5),
        kwargs={"bot": bot},
        id="dispatch_reminders",
        max_instances=1,
        coalesce=True,
        misfire_grace_time=30,
    )

    return scheduler
