from datetime import time, datetime
from typing import Optional
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.db.models.reminder import Reminder
from src.db.models.habit import Habit


class ReminderRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_id(self, reminder_id: int, user_id: int) -> Optional[Reminder]:
        result = await self.session.execute(
            select(Reminder).where(
                and_(Reminder.id == reminder_id, Reminder.user_id == user_id)
            )
        )
        return result.scalar_one_or_none()

    async def list_by_habit(self, habit_id: int) -> list[Reminder]:
        result = await self.session.execute(
            select(Reminder).where(Reminder.habit_id == habit_id).order_by(Reminder.time)
        )
        return list(result.scalars().all())

    async def list_by_user(self, user_id: int) -> list[Reminder]:
        result = await self.session.execute(
            select(Reminder).where(Reminder.user_id == user_id).order_by(Reminder.time)
        )
        return list(result.scalars().all())

    async def list_all_active_with_habit(self) -> list[tuple[Reminder, Habit]]:
        """Get every active reminder joined with its habit (and user via habit). Used by scheduler."""
        result = await self.session.execute(
            select(Reminder, Habit)
            .join(Habit, Habit.id == Reminder.habit_id)
            .options(selectinload(Habit.user), selectinload(Habit.streak))
            .where(Reminder.is_active == True, Habit.is_archived == False)
        )
        return [(r, h) for r, h in result.all()]

    async def create(
        self,
        habit_id: int,
        user_id: int,
        time_value: time,
        days_of_week: Optional[list[int]] = None,
    ) -> Reminder:
        reminder = Reminder(
            habit_id=habit_id,
            user_id=user_id,
            time=time_value,
            days_of_week=days_of_week if days_of_week is not None else [0, 1, 2, 3, 4, 5, 6],
        )
        self.session.add(reminder)
        await self.session.commit()
        await self.session.refresh(reminder)
        return reminder

    async def update(self, reminder: Reminder, **fields) -> Reminder:
        for k, v in fields.items():
            if v is not None and hasattr(reminder, k):
                setattr(reminder, k, v)
        await self.session.commit()
        await self.session.refresh(reminder)
        return reminder

    async def mark_sent(self, reminder: Reminder, sent_at: datetime) -> None:
        reminder.last_sent_at = sent_at
        await self.session.commit()

    async def delete(self, reminder: Reminder) -> None:
        await self.session.delete(reminder)
        await self.session.commit()
