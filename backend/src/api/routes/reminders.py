from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.dependencies.auth_dep import get_active_user
from src.api.dependencies.db_dep import get_session
from src.api.schemas.reminder import ReminderOut, ReminderCreate, ReminderUpdate
from src.db.models.user import User
from src.db.repositories.habit_repo import HabitRepository
from src.db.repositories.reminder_repo import ReminderRepository

router = APIRouter(tags=["reminders"])


@router.get("/api/habits/{habit_id}/reminders", response_model=list[ReminderOut])
async def list_for_habit(
    habit_id: int,
    user: User = Depends(get_active_user),
    session: AsyncSession = Depends(get_session),
):
    habit_repo = HabitRepository(session)
    habit = await habit_repo.get_by_id(habit_id, user.id)
    if not habit:
        raise HTTPException(404, "Habit not found")
    repo = ReminderRepository(session)
    return await repo.list_by_habit(habit_id)


@router.post(
    "/api/habits/{habit_id}/reminders",
    response_model=ReminderOut,
    status_code=status.HTTP_201_CREATED,
)
async def create_reminder(
    habit_id: int,
    payload: ReminderCreate,
    user: User = Depends(get_active_user),
    session: AsyncSession = Depends(get_session),
):
    habit_repo = HabitRepository(session)
    habit = await habit_repo.get_by_id(habit_id, user.id)
    if not habit:
        raise HTTPException(404, "Habit not found")

    if not payload.days_of_week or not all(0 <= d <= 6 for d in payload.days_of_week):
        raise HTTPException(400, "days_of_week must contain at least one day in [0..6]")

    repo = ReminderRepository(session)
    reminder = await repo.create(
        habit_id=habit_id,
        user_id=user.id,
        time_value=payload.time,
        days_of_week=payload.days_of_week,
    )
    if not payload.is_active:
        await repo.update(reminder, is_active=False)
    return reminder


@router.get("/api/reminders", response_model=list[ReminderOut])
async def list_all_reminders(
    user: User = Depends(get_active_user),
    session: AsyncSession = Depends(get_session),
):
    repo = ReminderRepository(session)
    return await repo.list_by_user(user.id)


@router.patch("/api/reminders/{reminder_id}", response_model=ReminderOut)
async def update_reminder(
    reminder_id: int,
    payload: ReminderUpdate,
    user: User = Depends(get_active_user),
    session: AsyncSession = Depends(get_session),
):
    repo = ReminderRepository(session)
    reminder = await repo.get_by_id(reminder_id, user.id)
    if not reminder:
        raise HTTPException(404, "Reminder not found")
    return await repo.update(reminder, **payload.model_dump(exclude_unset=True))


@router.delete("/api/reminders/{reminder_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_reminder(
    reminder_id: int,
    user: User = Depends(get_active_user),
    session: AsyncSession = Depends(get_session),
):
    repo = ReminderRepository(session)
    reminder = await repo.get_by_id(reminder_id, user.id)
    if not reminder:
        raise HTTPException(404, "Reminder not found")
    await repo.delete(reminder)
