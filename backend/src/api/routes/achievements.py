from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.dependencies.auth_dep import get_current_user
from src.api.dependencies.db_dep import get_session
from src.api.schemas.achievement import AchievementOut
from src.db.models.user import User
from src.db.repositories.achievement_repo import AchievementRepository

router = APIRouter(prefix="/api/achievements", tags=["achievements"])


@router.get("", response_model=list[AchievementOut])
async def list_achievements(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    repo = AchievementRepository(session)
    all_ach = await repo.list_all()
    unlocked_map = {
        a.id: ua
        for a, ua in await repo.list_unlocked(user.id)
    }
    out: list[AchievementOut] = []
    for ach in all_ach:
        ua = unlocked_map.get(ach.id)
        out.append(
            AchievementOut(
                id=ach.id,
                code=ach.code,
                name=ach.name,
                description=ach.description,
                icon=ach.icon,
                xp_reward=ach.xp_reward,
                category=ach.category,
                requirement_value=ach.requirement_value,
                unlocked=ua is not None,
                unlocked_at=ua.unlocked_at if ua else None,
            )
        )
    return out
