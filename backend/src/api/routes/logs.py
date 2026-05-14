from datetime import date
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.dependencies.auth_dep import get_current_user
from src.api.dependencies.db_dep import get_session
from src.api.schemas.habit import HabitLogOut
from src.db.models.user import User
from src.db.models.habit_log import HabitLog

router = APIRouter(prefix="/api/logs", tags=["logs"])


@router.get("", response_model=list[HabitLogOut])
async def list_logs(
    start: date = Query(..., description="Start date inclusive"),
    end: date = Query(..., description="End date inclusive"),
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(HabitLog).where(
            and_(
                HabitLog.user_id == user.id,
                HabitLog.log_date >= start,
                HabitLog.log_date <= end,
            )
        ).order_by(HabitLog.log_date)
    )
    return list(result.scalars().all())
