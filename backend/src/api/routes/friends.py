from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.dependencies.auth_dep import get_active_user
from src.api.dependencies.db_dep import get_session
from src.api.schemas.friend import FriendOut
from src.core.config import settings
from src.db.models.user import User
from src.db.repositories.friendship_repo import FriendshipRepository

router = APIRouter(prefix="/api/friends", tags=["friends"])


class InviteLinkOut(BaseModel):
    link: str
    code: str


@router.get("/invite-link", response_model=InviteLinkOut)
async def get_invite_link(user: User = Depends(get_active_user)):
    # Best-effort bot username; falls back to hardcoded
    bot_username = "my_hab1ts_tracker_bot"
    code = f"friend_{user.id}"
    return InviteLinkOut(
        link=f"https://t.me/{bot_username}?start={code}",
        code=code,
    )


@router.get("", response_model=list[FriendOut])
async def list_friends(
    user: User = Depends(get_active_user),
    session: AsyncSession = Depends(get_session),
):
    repo = FriendshipRepository(session)
    return await repo.list_friends(user.id)


@router.delete("/{friend_user_id}", status_code=204)
async def unfriend(
    friend_user_id: int,
    user: User = Depends(get_active_user),
    session: AsyncSession = Depends(get_session),
):
    repo = FriendshipRepository(session)
    removed = await repo.remove(user.id, friend_user_id)
    if not removed:
        raise HTTPException(404, "Friendship not found")
