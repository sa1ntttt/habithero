"""Reward processing after a check-in: XP, achievements, level-up."""
from dataclasses import dataclass, field
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.models.user import User
from src.db.models.habit import Habit
from src.services.xp_service import award_xp, XpAward
from src.services.achievement_service import (
    check_and_unlock,
    is_perfect_day,
    AchievementUnlock,
)
from src.services.streak_service import StreakUpdateResult


XP_PER_CHECKIN = 10
XP_PER_STREAK_DAY = 1
XP_MAX_STREAK_BONUS = 20


@dataclass
class CheckinReward:
    xp_award: XpAward
    new_achievements: list[AchievementUnlock] = field(default_factory=list)


async def process_checkin_reward(
    session: AsyncSession,
    user: User,
    habit: Habit,
    streak_result: StreakUpdateResult,
    check_date: date,
    became_quantity_done: bool = False,
) -> CheckinReward:
    """Award XP and check achievements after a successful check-in.

    Returns the combined XP earned (base + streak bonus + achievement bonuses) and unlocks.
    """
    # 1. Base XP for completing
    base_xp = XP_PER_CHECKIN if streak_result.streak_grew else 0

    # 2. Streak bonus: +1 XP per streak day, capped
    streak_n = streak_result.streak.current_streak
    streak_bonus = min(XP_MAX_STREAK_BONUS, max(0, streak_n - 1) * XP_PER_STREAK_DAY)

    total_base = base_xp + streak_bonus
    xp_award = await award_xp(session, user, total_base)

    # 3. Achievement flags from this action
    flags = {}
    if streak_result.freezes_used > 0:
        flags["freeze_used"] = True
    if became_quantity_done:
        flags["quantity_done"] = True
    if await is_perfect_day(session, user, check_date):
        flags["perfect_day"] = True

    # 4. Check and unlock achievements (this also awards their XP rewards)
    result = await check_and_unlock(session, user, flags=flags)
    # Update xp_award to include achievement bonuses (re-fetch user)
    if result.total_bonus_xp > 0:
        # The user's level/xp was already updated by check_and_unlock via award_xp calls.
        # Re-read to get accurate after-state.
        xp_award.xp_earned += result.total_bonus_xp
        xp_award.total_xp = user.total_xp
        xp_award.new_level = user.level
        xp_award.level_up = xp_award.level_up or (user.level > xp_award.old_level)

    # 5. After XP added, re-check level achievements (they depend on user.level)
    if xp_award.level_up:
        level_unlocks = await check_and_unlock(session, user, flags={})
        if level_unlocks.new_unlocks:
            result.new_unlocks.extend(level_unlocks.new_unlocks)
            xp_award.xp_earned += level_unlocks.total_bonus_xp
            xp_award.total_xp = user.total_xp
            xp_award.new_level = user.level

    return CheckinReward(xp_award=xp_award, new_achievements=result.new_unlocks)
