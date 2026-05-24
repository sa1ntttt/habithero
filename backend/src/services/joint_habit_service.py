"""Joint habits — create / accept / decline / shared streak.

A joint habit is an agreement between two users. When accepted, each
user gets a regular Habit row (linked via joint_habit_id) so they can
check in normally. The "shared streak" is computed by looking at the
last N days of *both* habits' logs — a day counts only if both users
have a "done" log for that date.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime, timedelta, timezone
from typing import Optional

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.models.habit import Habit, HabitType
from src.db.models.habit_log import HabitLog, LogStatus
from src.db.models.joint_habit import JointHabit
from src.db.repositories.joint_habit_repo import JointHabitRepository
from src.db.repositories.habit_repo import HabitRepository


@dataclass(frozen=True)
class SharedProgress:
    """Computed state of a joint habit for one viewer."""
    creator_done_today: bool
    partner_done_today: bool
    both_done_today: bool
    shared_streak: int


async def _link_habit_for_user(
    session: AsyncSession, joint: JointHabit, user_id: int
) -> Habit:
    """Create the Habit row for a member of a joint habit."""
    habit = Habit(
        user_id=user_id,
        name=joint.name,
        emoji=joint.emoji,
        color=joint.color,
        type=HabitType.binary,
        schedule=joint.schedule,
        joint_habit_id=joint.id,
    )
    session.add(habit)
    await session.commit()
    await session.refresh(habit)
    return habit


async def create_joint_habit(
    session: AsyncSession,
    creator_id: int,
    partner_id: int,
    name: str,
    emoji: str,
    schedule: dict,
    color: Optional[str] = None,
) -> JointHabit:
    """Create the agreement (status=pending) and create the creator's habit
    row immediately so they can start tracking from day 1."""
    repo = JointHabitRepository(session)
    joint = await repo.create(
        creator_id=creator_id,
        partner_id=partner_id,
        name=name,
        emoji=emoji,
        schedule=schedule,
        color=color,
    )
    await _link_habit_for_user(session, joint, creator_id)
    return joint


async def accept_joint_habit(
    session: AsyncSession, joint: JointHabit
) -> tuple[JointHabit, Habit]:
    """Mark active and create the partner's habit row."""
    repo = JointHabitRepository(session)
    joint = await repo.accept(joint)
    partner_habit = await _link_habit_for_user(session, joint, joint.partner_id)
    return joint, partner_habit


async def decline_joint_habit(
    session: AsyncSession, joint: JointHabit
) -> JointHabit:
    """Mark declined. The creator's habit row stays (they can still use it
    solo) but is unlinked from the joint."""
    repo = JointHabitRepository(session)
    return await repo.decline(joint)


async def end_joint_habit(
    session: AsyncSession, joint: JointHabit
) -> JointHabit:
    """Mark ended. Member habits are NOT deleted — users keep their progress
    individually. They just stop appearing as joint."""
    repo = JointHabitRepository(session)
    return await repo.end(joint)


async def _logs_by_date(
    session: AsyncSession, habit_id: int, since: date
) -> set[date]:
    """Return the set of dates on which this habit has a 'done' log."""
    result = await session.execute(
        select(HabitLog.log_date).where(
            and_(
                HabitLog.habit_id == habit_id,
                HabitLog.status == LogStatus.done,
                HabitLog.log_date >= since,
            )
        )
    )
    return {row[0] for row in result.all()}


async def compute_shared_progress(
    session: AsyncSession, joint: JointHabit, today: date
) -> SharedProgress:
    """Look at the last 365 days of both members' habit logs and compute
    the strict shared streak ending at today."""
    repo = JointHabitRepository(session)
    creator_habit = await repo.find_member_habit(joint.id, joint.creator_id)
    partner_habit = await repo.find_member_habit(joint.id, joint.partner_id)

    if creator_habit is None and partner_habit is None:
        return SharedProgress(False, False, False, 0)

    since = today - timedelta(days=365)
    creator_dates = (
        await _logs_by_date(session, creator_habit.id, since)
        if creator_habit
        else set()
    )
    partner_dates = (
        await _logs_by_date(session, partner_habit.id, since)
        if partner_habit
        else set()
    )

    creator_today = today in creator_dates
    partner_today = today in partner_dates
    both_today = creator_today and partner_today

    # Walk backwards counting consecutive days where both checked in.
    # If today neither has yet checked, start from yesterday — otherwise
    # we'd report 0 every morning.
    cursor = today if both_today else today - timedelta(days=1)
    streak = 0
    while cursor >= since:
        if cursor in creator_dates and cursor in partner_dates:
            streak += 1
            cursor -= timedelta(days=1)
        else:
            break

    return SharedProgress(
        creator_done_today=creator_today,
        partner_done_today=partner_today,
        both_done_today=both_today,
        shared_streak=streak,
    )


# Re-export for symmetry with other services
__all__ = [
    "SharedProgress",
    "create_joint_habit",
    "accept_joint_habit",
    "decline_joint_habit",
    "end_joint_habit",
    "compute_shared_progress",
]
