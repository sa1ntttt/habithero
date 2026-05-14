from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.dependencies.auth_dep import get_current_user
from src.api.dependencies.db_dep import get_session
from src.api.schemas.user import UserOut, UserUpdate
from src.db.models.user import User
from src.db.repositories.user_repo import UserRepository

router = APIRouter(prefix="/api/me", tags=["me"])


@router.get("", response_model=UserOut)
async def read_me(user: User = Depends(get_current_user)) -> User:
    return user


@router.patch("", response_model=UserOut)
async def update_me(
    payload: UserUpdate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> User:
    if payload.timezone is not None:
        repo = UserRepository(session)
        await repo.update_timezone(user, payload.timezone)
    if payload.language is not None:
        user.language = payload.language
        await session.commit()
        await session.refresh(user)
    return user
