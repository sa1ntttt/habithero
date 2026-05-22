from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel, ConfigDict
from sqlalchemy.ext.asyncio import AsyncSession
import pytz

from src.api.dependencies.auth_dep import get_active_user
from src.api.dependencies.db_dep import get_session
from src.api.schemas.habit import HabitOut, HabitLogOut
from src.db.models.user import User
from src.db.repositories.habit_repo import HabitRepository
from src.services.schedule_service import is_scheduled_for_date

router = APIRouter(prefix="/api/today", tags=["today"])


class TodayItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    habit: HabitOut
    log: Optional[HabitLogOut] = None


class TodayResponse(BaseModel):
    date: str
    items: list[TodayItem]


@router.get("", response_model=TodayResponse)
async def get_today(
    user: User = Depends(get_active_user),
    session: AsyncSession = Depends(get_session),
):
    tz = pytz.timezone(user.timezone)
    today = datetime.now(tz).date()

    repo = HabitRepository(session)
    all_habits = await repo.get_active_by_user(user.id)
    scheduled = [h for h in all_habits if is_scheduled_for_date(h, today)]

    items: list[TodayItem] = []
    for h in scheduled:
        log = await repo.get_log_for_date(h.id, today)
        items.append(TodayItem(
            habit=HabitOut.model_validate(h),
            log=HabitLogOut.model_validate(log) if log else None,
        ))

    return TodayResponse(date=today.isoformat(), items=items)
