from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.dependencies.auth_dep import get_current_user
from src.api.dependencies.db_dep import get_session
from src.api.schemas.user import UserOut, UserUpdate
from src.db.models.user import User
from src.db.repositories.user_repo import UserRepository
from src.services.xp_service import xp_for_level, xp_to_next_level

router = APIRouter(prefix="/api/me", tags=["me"])


def _user_to_out(user: User) -> UserOut:
    xp_current_level = xp_for_level(user.level)
    xp_next_level = xp_for_level(user.level + 1)
    return UserOut(
        id=user.id,
        telegram_id=user.telegram_id,
        username=user.username,
        first_name=user.first_name,
        timezone=user.timezone,
        language=user.language,
        level=user.level,
        total_xp=user.total_xp,
        xp_to_next_level=xp_to_next_level(user.total_xp),
        xp_in_current_level=user.total_xp - xp_current_level,
        xp_for_current_level=xp_next_level - xp_current_level,
        created_at=user.created_at,
    )


@router.get("", response_model=UserOut)
async def read_me(user: User = Depends(get_current_user)) -> UserOut:
    return _user_to_out(user)


@router.patch("", response_model=UserOut)
async def update_me(
    payload: UserUpdate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> UserOut:
    if payload.timezone is not None:
        repo = UserRepository(session)
        await repo.update_timezone(user, payload.timezone)
    if payload.language is not None:
        user.language = payload.language
        await session.commit()
        await session.refresh(user)
    return _user_to_out(user)
