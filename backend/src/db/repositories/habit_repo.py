from datetime import date
from typing import Optional
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.models.habit import Habit, HabitType
from src.db.models.habit_log import HabitLog, LogStatus


class HabitRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_active_by_user(self, user_id: int) -> list[Habit]:
        result = await self.session.execute(
            select(Habit).where(
                and_(Habit.user_id == user_id, Habit.is_archived == False)
            )
        )
        return list(result.scalars().all())

    async def get_by_id(self, habit_id: int, user_id: int) -> Optional[Habit]:
        result = await self.session.execute(
            select(Habit).where(and_(Habit.id == habit_id, Habit.user_id == user_id))
        )
        return result.scalar_one_or_none()

    async def create(
        self,
        user_id: int,
        name: str,
        emoji: str = "✅",
        description: Optional[str] = None,
        habit_type: HabitType = HabitType.binary,
        schedule: Optional[dict] = None,
        target_value: Optional[float] = None,
        unit: Optional[str] = None,
    ) -> Habit:
        habit = Habit(
            user_id=user_id,
            name=name,
            emoji=emoji,
            description=description,
            type=habit_type,
            target_value=target_value,
            unit=unit,
            schedule=schedule or {"type": "daily"},
        )
        self.session.add(habit)
        await self.session.commit()
        await self.session.refresh(habit)
        return habit

    async def log_done(self, habit_id: int, user_id: int, log_date: date) -> HabitLog:
        existing = await self.session.execute(
            select(HabitLog).where(
                and_(
                    HabitLog.habit_id == habit_id,
                    HabitLog.log_date == log_date,
                )
            )
        )
        log = existing.scalar_one_or_none()
        if log:
            log.status = LogStatus.done
        else:
            log = HabitLog(
                habit_id=habit_id,
                user_id=user_id,
                log_date=log_date,
                status=LogStatus.done,
            )
            self.session.add(log)
        await self.session.commit()
        await self.session.refresh(log)
        return log

    async def log_value(
        self,
        habit_id: int,
        user_id: int,
        log_date: date,
        increment: float,
        target: Optional[float],
    ) -> tuple[HabitLog, bool]:
        """Accumulate value into today's log. Returns (log, became_done)."""
        log = await self.get_log_for_date(habit_id, log_date)
        was_done = log is not None and log.status == LogStatus.done

        if not log:
            log = HabitLog(
                habit_id=habit_id,
                user_id=user_id,
                log_date=log_date,
                value=increment,
                status=LogStatus.failed,
            )
            self.session.add(log)
        else:
            log.value = (log.value or 0) + increment

        # If target reached, flip to done
        if target is not None and (log.value or 0) >= target:
            log.status = LogStatus.done

        await self.session.commit()
        await self.session.refresh(log)
        became_done = (log.status == LogStatus.done) and not was_done
        return log, became_done

    async def reset_today_log(self, habit_id: int, log_date: date) -> Optional[HabitLog]:
        """Reset today's log: value=0, status=failed. Returns the log if existed."""
        log = await self.get_log_for_date(habit_id, log_date)
        if not log:
            return None
        log.value = 0
        log.status = LogStatus.failed
        await self.session.commit()
        await self.session.refresh(log)
        return log

    async def get_log_for_date(self, habit_id: int, log_date: date) -> Optional[HabitLog]:
        result = await self.session.execute(
            select(HabitLog).where(
                and_(HabitLog.habit_id == habit_id, HabitLog.log_date == log_date)
            )
        )
        return result.scalar_one_or_none()

    async def get_logs_range(
        self, habit_id: int, start: date, end: date
    ) -> list[HabitLog]:
        result = await self.session.execute(
            select(HabitLog).where(
                and_(
                    HabitLog.habit_id == habit_id,
                    HabitLog.log_date >= start,
                    HabitLog.log_date <= end,
                )
            ).order_by(HabitLog.log_date)
        )
        return list(result.scalars().all())

    async def update(self, habit: Habit, **fields) -> Habit:
        for k, v in fields.items():
            if v is not None and hasattr(habit, k):
                setattr(habit, k, v)
        await self.session.commit()
        await self.session.refresh(habit)
        return habit

    async def archive(self, habit: Habit) -> Habit:
        habit.is_archived = True
        await self.session.commit()
        await self.session.refresh(habit)
        return habit
