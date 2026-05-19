from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.dependencies.auth_dep import get_current_user
from src.api.dependencies.db_dep import get_session
from src.api.schemas.feed import FeedItem
from src.db.models.user import User
from src.db.repositories.friendship_repo import FriendshipRepository
from src.db.repositories.activity_repo import ActivityRepository

router = APIRouter(prefix="/api/feed", tags=["feed"])


@router.get("", response_model=list[FeedItem])
async def get_feed(
    limit: int = Query(50, ge=1, le=200),
    days: int = Query(30, ge=1, le=365),
    include_self: bool = Query(True),
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Activity feed: own events + friends' events."""
    friendship_repo = FriendshipRepository(session)
    friends = await friendship_repo.list_friends(user.id)

    user_ids = [f.id for f in friends]
    if include_self:
        user_ids.append(user.id)

    if not user_ids:
        return []

    events = await ActivityRepository(session).list_for_users(user_ids, limit=limit, days=days)

    # Fetch user names for events
    actor_ids = list({e.user_id for e in events})
    user_map: dict[int, User] = {}
    if actor_ids:
        result = await session.execute(select(User).where(User.id.in_(actor_ids)))
        user_map = {u.id: u for u in result.scalars().all()}

    out: list[FeedItem] = []
    for e in events:
        actor = user_map.get(e.user_id)
        out.append(
            FeedItem(
                id=e.id,
                user_id=e.user_id,
                user_name=actor.username if actor and actor.username else (actor.first_name if actor else "?"),
                user_first_name=actor.first_name if actor else "?",
                event_type=e.event_type,
                payload=e.payload or {},
                created_at=e.created_at,
            )
        )
    return out
