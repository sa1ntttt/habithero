from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.dependencies.auth_dep import get_active_user
from src.api.dependencies.db_dep import get_session
from src.api.schemas.stats import OverallStats
from src.db.models.habit import Habit
from src.db.models.habit_log import HabitLog, LogStatus
from src.db.models.streak import Streak
from src.db.models.user import User

router = APIRouter(prefix="/api/stats", tags=["stats"])


@router.get("", response_model=OverallStats)
async def overall_stats(
    user: User = Depends(get_active_user),
    session: AsyncSession = Depends(get_session),
):
    total_habits_q = await session.execute(
        select(func.count()).select_from(Habit).where(Habit.user_id == user.id)
    )
    total_habits = total_habits_q.scalar_one()

    active_habits_q = await session.execute(
        select(func.count()).select_from(Habit).where(
            Habit.user_id == user.id, Habit.is_archived == False
        )
    )
    active_habits = active_habits_q.scalar_one()

    total_checkins_q = await session.execute(
        select(func.count()).select_from(HabitLog).where(
            HabitLog.user_id == user.id, HabitLog.status == LogStatus.done
        )
    )
    total_checkins = total_checkins_q.scalar_one()

    longest_q = await session.execute(
        select(func.coalesce(func.max(Streak.longest_streak), 0))
        .select_from(Streak)
        .join(Habit, Habit.id == Streak.habit_id)
        .where(Habit.user_id == user.id)
    )
    longest = longest_q.scalar_one()

    active_streaks_q = await session.execute(
        select(func.count())
        .select_from(Streak)
        .join(Habit, Habit.id == Streak.habit_id)
        .where(Habit.user_id == user.id, Streak.current_streak > 0)
    )
    active_streaks = active_streaks_q.scalar_one()

    return OverallStats(
        total_habits=total_habits,
        active_habits=active_habits,
        total_checkins=total_checkins,
        longest_streak=longest,
        current_active_streaks=active_streaks,
    )
