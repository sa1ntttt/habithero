from dataclasses import dataclass
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.models.habit import Habit
from src.db.models.streak import Streak
from src.db.repositories.streak_repo import StreakRepository
from src.services.schedule_service import count_scheduled_days_between


@dataclass
class StreakUpdateResult:
    streak: Streak
    streak_grew: bool
    freezes_used: int


async def apply_checkin(session: AsyncSession, habit: Habit, check_date: date) -> StreakUpdateResult:
    """Update the habit's streak after a check-in for a specific date.

    Rules:
    - If checking in for today and last_check_date == today: nothing changes.
    - If no previous check-in: streak starts at 1.
    - If gap (in scheduled days) is 0: streak += 1.
    - If gap > 0 and enough freezes: use freezes, streak += 1.
    - Otherwise: streak resets to 1.
    """
    repo = StreakRepository(session)
    streak = await repo.get_or_create(habit.id)

    if streak.last_check_date == check_date:
        return StreakUpdateResult(streak=streak, streak_grew=False, freezes_used=0)

    freezes_used = 0
    streak_grew = False

    if streak.last_check_date is None or streak.current_streak == 0:
        streak.current_streak = 1
        streak_grew = True
    else:
        missed_scheduled = count_scheduled_days_between(habit, streak.last_check_date, check_date)
        if missed_scheduled == 0:
            streak.current_streak += 1
            streak_grew = True
        elif streak.freezes_available >= missed_scheduled:
            streak.freezes_available -= missed_scheduled
            freezes_used = missed_scheduled
            streak.current_streak += 1
            streak_grew = True
        else:
            streak.current_streak = 1
            streak_grew = True

    streak.last_check_date = check_date
    if streak.current_streak > streak.longest_streak:
        streak.longest_streak = streak.current_streak

    await repo.save(streak)
    return StreakUpdateResult(streak=streak, streak_grew=streak_grew, freezes_used=freezes_used)
