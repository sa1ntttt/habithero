from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.models.joint_habit import JointHabit
from src.db.models.habit import Habit


class JointHabitRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_id(self, joint_id: int) -> Optional[JointHabit]:
        result = await self.session.execute(
            select(JointHabit).where(JointHabit.id == joint_id)
        )
        return result.scalar_one_or_none()

    async def list_for_user(
        self, user_id: int, include_pending: bool = True
    ) -> list[JointHabit]:
        """All joint habits the user is a member of (creator or partner),
        excluding declined / ended ones."""
        statuses = ["active", "pending"] if include_pending else ["active"]
        result = await self.session.execute(
            select(JointHabit)
            .where(
                or_(
                    JointHabit.creator_id == user_id,
                    JointHabit.partner_id == user_id,
                )
            )
            .where(JointHabit.status.in_(statuses))
            .order_by(JointHabit.created_at.desc())
        )
        return list(result.scalars().all())

    async def list_incoming_pending(self, user_id: int) -> list[JointHabit]:
        """Pending invitations addressed TO this user (they are partner_id)."""
        result = await self.session.execute(
            select(JointHabit)
            .where(JointHabit.partner_id == user_id, JointHabit.status == "pending")
            .order_by(JointHabit.created_at.desc())
        )
        return list(result.scalars().all())

    async def create(
        self,
        creator_id: int,
        partner_id: int,
        name: str,
        emoji: str,
        schedule: dict,
        color: Optional[str] = None,
    ) -> JointHabit:
        joint = JointHabit(
            creator_id=creator_id,
            partner_id=partner_id,
            name=name,
            emoji=emoji,
            color=color,
            schedule=schedule,
            status="pending",
        )
        self.session.add(joint)
        await self.session.commit()
        await self.session.refresh(joint)
        return joint

    async def accept(self, joint: JointHabit) -> JointHabit:
        joint.status = "active"
        joint.accepted_at = datetime.now(tz=timezone.utc)
        await self.session.commit()
        await self.session.refresh(joint)
        return joint

    async def decline(self, joint: JointHabit) -> JointHabit:
        joint.status = "declined"
        joint.ended_at = datetime.now(tz=timezone.utc)
        await self.session.commit()
        await self.session.refresh(joint)
        return joint

    async def end(self, joint: JointHabit) -> JointHabit:
        joint.status = "ended"
        joint.ended_at = datetime.now(tz=timezone.utc)
        await self.session.commit()
        await self.session.refresh(joint)
        return joint

    async def find_member_habit(
        self, joint_id: int, user_id: int
    ) -> Optional[Habit]:
        """Return the Habit row linked to this joint for a specific user."""
        result = await self.session.execute(
            select(Habit).where(
                and_(Habit.joint_habit_id == joint_id, Habit.user_id == user_id)
            )
        )
        return result.scalar_one_or_none()
