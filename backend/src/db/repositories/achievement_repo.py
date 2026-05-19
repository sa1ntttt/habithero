from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.models.achievement import Achievement, UserAchievement


class AchievementRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def list_all(self) -> list[Achievement]:
        result = await self.session.execute(
            select(Achievement).order_by(Achievement.sort_order, Achievement.id)
        )
        return list(result.scalars().all())

    async def list_unlocked(self, user_id: int) -> list[tuple[Achievement, UserAchievement]]:
        result = await self.session.execute(
            select(Achievement, UserAchievement)
            .join(UserAchievement, UserAchievement.achievement_id == Achievement.id)
            .where(UserAchievement.user_id == user_id)
        )
        return [(a, ua) for a, ua in result.all()]

    async def get_unlocked_codes(self, user_id: int) -> set[str]:
        result = await self.session.execute(
            select(Achievement.code)
            .join(UserAchievement, UserAchievement.achievement_id == Achievement.id)
            .where(UserAchievement.user_id == user_id)
        )
        return {row[0] for row in result.all()}

    async def unlock(self, user_id: int, achievement_id: int) -> None:
        # Idempotent: check if already exists
        existing = await self.session.execute(
            select(UserAchievement).where(
                and_(
                    UserAchievement.user_id == user_id,
                    UserAchievement.achievement_id == achievement_id,
                )
            )
        )
        if existing.scalar_one_or_none():
            return
        ua = UserAchievement(user_id=user_id, achievement_id=achievement_id)
        self.session.add(ua)
        await self.session.commit()
