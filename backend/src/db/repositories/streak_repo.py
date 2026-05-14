from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.models.streak import Streak


class StreakRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_habit_id(self, habit_id: int) -> Optional[Streak]:
        result = await self.session.execute(
            select(Streak).where(Streak.habit_id == habit_id)
        )
        return result.scalar_one_or_none()

    async def get_or_create(self, habit_id: int) -> Streak:
        streak = await self.get_by_habit_id(habit_id)
        if streak:
            return streak
        streak = Streak(habit_id=habit_id)
        self.session.add(streak)
        await self.session.commit()
        await self.session.refresh(streak)
        return streak

    async def save(self, streak: Streak) -> Streak:
        await self.session.commit()
        await self.session.refresh(streak)
        return streak
