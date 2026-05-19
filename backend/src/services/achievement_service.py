"""Achievement system: check user progress and unlock achievements."""
from dataclasses import dataclass
from datetime import date
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.models.user import User
from src.db.models.habit import Habit
from src.db.models.habit_log import HabitLog, LogStatus
from src.db.models.streak import Streak
from src.db.models.achievement import Achievement
from src.db.repositories.achievement_repo import AchievementRepository
from src.services.xp_service import award_xp


@dataclass
class AchievementUnlock:
    code: str
    name: str
    icon: str
    description: str
    xp_reward: int


@dataclass
class CheckResult:
    new_unlocks: list[AchievementUnlock]
    total_bonus_xp: int


async def _compute_progress(session: AsyncSession, user: User) -> dict[str, int]:
    """Compute current metrics for all requirement_types."""
    # habits_created: active (non-archived) habits
    habits_q = await session.execute(
        select(func.count()).select_from(Habit).where(
            and_(Habit.user_id == user.id, Habit.is_archived == False)
        )
    )
    habits_created = habits_q.scalar_one()

    # checkins_total: done logs
    checkins_q = await session.execute(
        select(func.count()).select_from(HabitLog).where(
            and_(HabitLog.user_id == user.id, HabitLog.status == LogStatus.done)
        )
    )
    checkins_total = checkins_q.scalar_one()

    # streak_max: max longest_streak across user's habits
    streak_q = await session.execute(
        select(func.coalesce(func.max(Streak.longest_streak), 0))
        .select_from(Streak)
        .join(Habit, Habit.id == Streak.habit_id)
        .where(Habit.user_id == user.id)
    )
    streak_max = streak_q.scalar_one()

    return {
        "habits_created": habits_created,
        "checkins_total": checkins_total,
        "streak_max": streak_max,
        "level": user.level,
    }


async def check_and_unlock(
    session: AsyncSession,
    user: User,
    flags: dict[str, bool] | None = None,
) -> CheckResult:
    """Re-check all achievements; unlock newly-met ones; return list of unlocked.

    `flags` are one-shot triggers, e.g. {"freeze_used": True, "quantity_done": True, "perfect_day": True}.
    """
    flags = flags or {}
    repo = AchievementRepository(session)
    all_ach = await repo.list_all()
    unlocked_codes = await repo.get_unlocked_codes(user.id)
    progress = await _compute_progress(session, user)

    new_unlocks: list[AchievementUnlock] = []
    bonus_xp = 0

    for ach in all_ach:
        if ach.code in unlocked_codes:
            continue

        req_type = ach.requirement_type
        req_value = ach.requirement_value

        unlocked = False
        if req_type in progress:
            unlocked = progress[req_type] >= req_value
        elif req_type in flags:
            unlocked = bool(flags[req_type])
        # perfect_day with req_value > 1 needs special handling — skip for v1

        if unlocked:
            await repo.unlock(user.id, ach.id)
            new_unlocks.append(
                AchievementUnlock(
                    code=ach.code,
                    name=ach.name,
                    icon=ach.icon,
                    description=ach.description,
                    xp_reward=ach.xp_reward,
                )
            )
            # Award XP for unlocking
            if ach.xp_reward > 0:
                xp_result = await award_xp(session, user, ach.xp_reward)
                bonus_xp += xp_result.xp_earned

    return CheckResult(new_unlocks=new_unlocks, total_bonus_xp=bonus_xp)


async def is_perfect_day(session: AsyncSession, user: User, today: date) -> bool:
    """Check if all scheduled habits for today are done."""
    from src.services.schedule_service import is_scheduled_for_date
    from src.db.repositories.habit_repo import HabitRepository

    habits = await HabitRepository(session).get_active_by_user(user.id)
    scheduled = [h for h in habits if is_scheduled_for_date(h, today)]
    if not scheduled:
        return False
    for h in scheduled:
        log = await HabitRepository(session).get_log_for_date(h.id, today)
        if not log or log.status != LogStatus.done:
            return False
    return True
