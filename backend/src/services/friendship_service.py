"""Friendship business logic."""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.models.user import User
from src.db.repositories.friendship_repo import FriendshipRepository


async def accept_invitation_by_user_id(
    session: AsyncSession,
    clicker: User,
    inviter_user_id: int,
) -> tuple[bool, str, User | None]:
    """Handle a click on someone's invite link (deep link: friend_<user_id>).

    The clicker becomes friends with the inviter. Returns (success, message, inviter_user).
    """
    if inviter_user_id == clicker.id:
        return False, "Это твой собственный код приглашения 🤔", None

    result = await session.execute(select(User).where(User.id == inviter_user_id))
    inviter = result.scalar_one_or_none()
    if not inviter:
        return False, "Приглашающий пользователь не найден 🤷", None

    repo = FriendshipRepository(session)
    if await repo.are_friends(clicker.id, inviter.id):
        return True, f"Вы уже друзья с <b>{inviter.first_name}</b> 👋", inviter

    # Inviter (link sharer) marked as the requester. Auto-accept.
    await repo.create_or_accept(
        requester_id=inviter.id,
        receiver_id=clicker.id,
        auto_accept=True,
    )
    return True, f"🎉 Вы теперь друзья с <b>{inviter.first_name}</b>!", inviter
