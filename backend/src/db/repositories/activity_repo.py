from datetime import datetime, timedelta
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.models.activity import ActivityEvent


class ActivityRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def log(self, user_id: int, event_type: str, payload: dict) -> ActivityEvent:
        event = ActivityEvent(user_id=user_id, event_type=event_type, payload=payload)
        self.session.add(event)
        await self.session.commit()
        await self.session.refresh(event)
        return event

    async def list_for_users(
        self,
        user_ids: list[int],
        limit: int = 50,
        days: int = 30,
    ) -> list[ActivityEvent]:
        if not user_ids:
            return []
        since = datetime.utcnow() - timedelta(days=days)
        result = await self.session.execute(
            select(ActivityEvent)
            .where(
                ActivityEvent.user_id.in_(user_ids),
                ActivityEvent.created_at >= since,
            )
            .order_by(ActivityEvent.created_at.desc())
            .limit(limit)
        )
        return list(result.scalars().all())
