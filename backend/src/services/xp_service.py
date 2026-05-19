"""XP and level system.

Level formula: total XP needed to reach level N = (N-1)² × 100
- Level 1: 0 XP
- Level 2: 100 XP
- Level 3: 400 XP
- Level 4: 900 XP
- Level 5: 1600 XP
- ...
"""
import math
from dataclasses import dataclass
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.models.user import User


@dataclass
class XpAward:
    xp_earned: int
    total_xp: int
    new_level: int
    old_level: int
    level_up: bool


def level_for_xp(xp: int) -> int:
    """Compute level from total XP."""
    if xp < 100:
        return 1
    return int(math.sqrt(xp / 100)) + 1


def xp_for_level(level: int) -> int:
    """Total XP needed to be at this level."""
    return (max(1, level) - 1) ** 2 * 100


def xp_to_next_level(xp: int) -> int:
    """How many XP until next level up."""
    current = level_for_xp(xp)
    return xp_for_level(current + 1) - xp


async def award_xp(session: AsyncSession, user: User, amount: int) -> XpAward:
    if amount <= 0:
        return XpAward(0, user.total_xp, user.level, user.level, False)

    old_level = user.level
    user.total_xp = (user.total_xp or 0) + amount
    new_level = level_for_xp(user.total_xp)
    level_up = new_level > old_level
    user.level = new_level

    await session.commit()
    await session.refresh(user)
    return XpAward(amount, user.total_xp, new_level, old_level, level_up)
