from datetime import datetime
from typing import Optional
from sqlalchemy import select, and_, or_, case
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.models.friendship import Friendship, FriendshipStatus
from src.db.models.user import User


class FriendshipRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_between(self, a_id: int, b_id: int) -> Optional[Friendship]:
        result = await self.session.execute(
            select(Friendship).where(
                or_(
                    and_(Friendship.requester_id == a_id, Friendship.receiver_id == b_id),
                    and_(Friendship.requester_id == b_id, Friendship.receiver_id == a_id),
                )
            )
        )
        return result.scalar_one_or_none()

    async def are_friends(self, a_id: int, b_id: int) -> bool:
        f = await self.get_between(a_id, b_id)
        return f is not None and f.status == FriendshipStatus.accepted

    async def list_friends(self, user_id: int) -> list[User]:
        # The "other side" of any accepted friendship involving user_id
        other_side = case(
            (Friendship.requester_id == user_id, Friendship.receiver_id),
            else_=Friendship.requester_id,
        )
        subq = (
            select(other_side.label("friend_id"))
            .where(
                or_(
                    Friendship.requester_id == user_id,
                    Friendship.receiver_id == user_id,
                ),
                Friendship.status == FriendshipStatus.accepted,
            )
            .subquery()
        )
        result = await self.session.execute(
            select(User).join(subq, User.id == subq.c.friend_id)
        )
        return list(result.scalars().all())

    async def list_incoming_pending(self, user_id: int) -> list[Friendship]:
        result = await self.session.execute(
            select(Friendship).where(
                Friendship.receiver_id == user_id,
                Friendship.status == FriendshipStatus.pending,
            )
        )
        return list(result.scalars().all())

    async def create_or_accept(
        self, requester_id: int, receiver_id: int, auto_accept: bool = True
    ) -> tuple[Friendship, bool]:
        """Create friendship, or accept it if already pending in opposite direction.

        Returns (friendship, was_just_accepted).
        """
        existing = await self.get_between(requester_id, receiver_id)
        if existing:
            if existing.status == FriendshipStatus.accepted:
                return existing, False
            # If pending in opposite direction, accept it
            if (
                existing.status == FriendshipStatus.pending
                and existing.requester_id == receiver_id
            ):
                existing.status = FriendshipStatus.accepted
                existing.responded_at = datetime.utcnow()
                await self.session.commit()
                await self.session.refresh(existing)
                return existing, True
            return existing, False

        new = Friendship(
            requester_id=requester_id,
            receiver_id=receiver_id,
            status=FriendshipStatus.accepted if auto_accept else FriendshipStatus.pending,
            responded_at=datetime.utcnow() if auto_accept else None,
        )
        self.session.add(new)
        await self.session.commit()
        await self.session.refresh(new)
        return new, auto_accept

    async def remove(self, user_a: int, user_b: int) -> bool:
        f = await self.get_between(user_a, user_b)
        if not f:
            return False
        await self.session.delete(f)
        await self.session.commit()
        return True
