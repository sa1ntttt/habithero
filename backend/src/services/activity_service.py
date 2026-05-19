"""Helpers to log activity events into the feed."""
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.repositories.activity_repo import ActivityRepository


async def log_checkin(
    session: AsyncSession,
    user_id: int,
    habit_id: int,
    habit_name: str,
    habit_emoji: str,
    streak: int,
) -> None:
    await ActivityRepository(session).log(
        user_id=user_id,
        event_type="checkin",
        payload={
            "habit_id": habit_id,
            "habit_name": habit_name,
            "habit_emoji": habit_emoji,
            "streak": streak,
        },
    )


async def log_achievement(
    session: AsyncSession,
    user_id: int,
    code: str,
    name: str,
    icon: str,
) -> None:
    await ActivityRepository(session).log(
        user_id=user_id,
        event_type="achievement",
        payload={"code": code, "name": name, "icon": icon},
    )


async def log_level_up(session: AsyncSession, user_id: int, new_level: int) -> None:
    await ActivityRepository(session).log(
        user_id=user_id,
        event_type="level_up",
        payload={"new_level": new_level},
    )
