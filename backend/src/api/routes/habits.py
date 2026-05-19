from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
import pytz

from src.api.dependencies.auth_dep import get_current_user
from src.api.dependencies.db_dep import get_session
from src.api.schemas.habit import (
    HabitOut,
    HabitCreate,
    HabitUpdate,
    HabitLogOut,
    CheckinRequest,
    CheckinResponse,
    StreakOut,
)
from src.db.models.user import User
from src.db.models.habit import Habit
from src.db.repositories.habit_repo import HabitRepository
from src.services.streak_service import apply_checkin

router = APIRouter(prefix="/api/habits", tags=["habits"])


def _user_today(user: User) -> date:
    return datetime.now(pytz.timezone(user.timezone)).date()


@router.get("", response_model=list[HabitOut])
async def list_habits(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    repo = HabitRepository(session)
    return await repo.get_active_by_user(user.id)


@router.post("", response_model=HabitOut, status_code=status.HTTP_201_CREATED)
async def create_habit(
    payload: HabitCreate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    repo = HabitRepository(session)
    habit = await repo.create(
        user_id=user.id,
        name=payload.name,
        emoji=payload.emoji,
        description=payload.description,
        habit_type=payload.type,
        schedule=payload.schedule,
    )
    return habit


@router.get("/{habit_id}", response_model=HabitOut)
async def get_habit(
    habit_id: int,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    repo = HabitRepository(session)
    habit = await repo.get_by_id(habit_id, user.id)
    if not habit:
        raise HTTPException(404, "Habit not found")
    return habit


@router.patch("/{habit_id}", response_model=HabitOut)
async def update_habit(
    habit_id: int,
    payload: HabitUpdate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    repo = HabitRepository(session)
    habit = await repo.get_by_id(habit_id, user.id)
    if not habit:
        raise HTTPException(404, "Habit not found")
    return await repo.update(habit, **payload.model_dump(exclude_unset=True))


@router.delete("/{habit_id}", status_code=status.HTTP_204_NO_CONTENT)
async def archive_habit(
    habit_id: int,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    repo = HabitRepository(session)
    habit = await repo.get_by_id(habit_id, user.id)
    if not habit:
        raise HTTPException(404, "Habit not found")
    await repo.archive(habit)


@router.get("/{habit_id}/logs", response_model=list[HabitLogOut])
async def get_logs(
    habit_id: int,
    start: date = Query(..., description="Start date inclusive"),
    end: date = Query(..., description="End date inclusive"),
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    repo = HabitRepository(session)
    habit = await repo.get_by_id(habit_id, user.id)
    if not habit:
        raise HTTPException(404, "Habit not found")
    return await repo.get_logs_range(habit_id, start, end)


@router.post("/{habit_id}/reset_today", status_code=status.HTTP_204_NO_CONTENT)
async def reset_today(
    habit_id: int,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Reset today's log to 0/failed (for quantity habits)."""
    repo = HabitRepository(session)
    habit = await repo.get_by_id(habit_id, user.id)
    if not habit:
        raise HTTPException(404, "Habit not found")
    today = _user_today(user)
    await repo.reset_today_log(habit_id, today)


@router.post("/{habit_id}/checkin", response_model=CheckinResponse)
async def checkin(
    habit_id: int,
    payload: CheckinRequest,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    from src.db.models.habit import HabitType

    repo = HabitRepository(session)
    habit = await repo.get_by_id(habit_id, user.id)
    if not habit:
        raise HTTPException(404, "Habit not found")

    check_date = payload.log_date or _user_today(user)

    # Quantity habit: accumulate value, only mark done when target reached
    if habit.type == HabitType.quantity and payload.value is not None:
        increment = float(payload.value)
        log_entry, became_done = await repo.log_value(
            habit_id, user.id, check_date, increment, habit.target_value
        )
        if became_done:
            result = await apply_checkin(session, habit, check_date)
        else:
            # Just update streak object without changing it (read current state)
            from src.db.repositories.streak_repo import StreakRepository
            streak = await StreakRepository(session).get_or_create(habit.id)
            from src.services.streak_service import StreakUpdateResult
            result = StreakUpdateResult(streak=streak, streak_grew=False, freezes_used=0)
    else:
        # Binary habit (or fallback): mark done immediately
        log_entry = await repo.log_done(habit_id, user.id, check_date)
        result = await apply_checkin(session, habit, check_date)

    return CheckinResponse(
        log=HabitLogOut.model_validate(log_entry),
        streak=StreakOut.model_validate(result.streak),
        streak_grew=result.streak_grew,
        freezes_used=result.freezes_used,
    )
