"""Reminder dispatch service.

Called every minute by APScheduler. Walks all active reminders, computes each
user's local time, and sends the message if all conditions are met.
"""
from datetime import datetime, timedelta
from aiogram import Bot
from aiogram.types import InlineKeyboardMarkup
from aiogram.utils.keyboard import InlineKeyboardBuilder
from aiogram.exceptions import TelegramForbiddenError, TelegramBadRequest
import pytz

from src.core.logger import get_logger
from src.db.session import AsyncSessionFactory
from src.db.repositories.reminder_repo import ReminderRepository
from src.db.repositories.habit_repo import HabitRepository
from src.db.models.habit_log import LogStatus
from src.services.schedule_service import is_scheduled_for_date

log = get_logger(__name__)


def reminder_action_keyboard(habit_id: int) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.button(text="✅ Готово", callback_data=f"rem_done:{habit_id}")
    builder.button(text="🚫 Не сегодня", callback_data=f"rem_skip:{habit_id}")
    builder.adjust(2)
    return builder.as_markup()


async def dispatch_due_reminders(bot: Bot) -> None:
    """Find and send reminders due right now (current minute in user's tz)."""
    async with AsyncSessionFactory() as session:
        reminder_repo = ReminderRepository(session)
        habit_repo = HabitRepository(session)
        all_active = await reminder_repo.list_all_active_with_habit()

        now_utc = datetime.now(pytz.UTC)

        for reminder, habit in all_active:
            user = habit.user
            try:
                tz = pytz.timezone(user.timezone)
            except pytz.exceptions.UnknownTimeZoneError:
                tz = pytz.UTC
            local_now = now_utc.astimezone(tz)

            # Check minute precision
            if local_now.hour != reminder.time.hour or local_now.minute != reminder.time.minute:
                continue

            # Check today's weekday is in the reminder's days
            weekday = local_now.weekday()
            if weekday not in reminder.days_of_week:
                continue

            # Check the habit itself is scheduled today
            today = local_now.date()
            if not is_scheduled_for_date(habit, today):
                continue

            # Don't resend in the same day
            if reminder.last_sent_at:
                last_sent_local = reminder.last_sent_at.astimezone(tz)
                if last_sent_local.date() == today:
                    continue

            # Skip if habit already done today
            existing = await habit_repo.get_log_for_date(habit.id, today)
            if existing and existing.status == LogStatus.done:
                continue

            # Send the reminder
            try:
                await bot.send_message(
                    chat_id=user.telegram_id,
                    text=(
                        f"⏰ Пора отметить привычку!\n\n"
                        f"{habit.emoji} <b>{habit.name}</b>"
                    ),
                    parse_mode="HTML",
                    reply_markup=reminder_action_keyboard(habit.id),
                )
                await reminder_repo.mark_sent(reminder, now_utc)
                log.info(
                    "reminder sent",
                    user_id=user.id,
                    habit_id=habit.id,
                    reminder_id=reminder.id,
                )
            except TelegramForbiddenError:
                log.warning(
                    "user blocked the bot — deactivating reminder",
                    user_id=user.id,
                    reminder_id=reminder.id,
                )
                await reminder_repo.update(reminder, is_active=False)
            except TelegramBadRequest as e:
                log.error("failed to send reminder", error=str(e), reminder_id=reminder.id)
