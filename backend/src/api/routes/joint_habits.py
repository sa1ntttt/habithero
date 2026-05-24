from datetime import datetime
from typing import Optional

from aiogram import Bot
from fastapi import APIRouter, Depends, HTTPException, Request, status
import pytz
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.dependencies.auth_dep import get_active_user
from src.api.dependencies.db_dep import get_session
from src.api.schemas.joint_habit import (
    JointHabitCreate,
    JointHabitOut,
    JointPartnerInfo,
)
from src.core.config import settings
from src.core.logger import get_logger
from src.db.models.joint_habit import JointHabit
from src.db.models.user import User
from src.db.repositories.friendship_repo import FriendshipRepository
from src.db.repositories.joint_habit_repo import JointHabitRepository
from src.db.repositories.user_repo import UserRepository
from src.services.joint_habit_service import (
    accept_joint_habit,
    compute_shared_progress,
    create_joint_habit,
    decline_joint_habit,
    end_joint_habit,
)

router = APIRouter(prefix="/api/joint-habits", tags=["joint-habits"])
log = get_logger(__name__)


def _user_today(user: User):
    return datetime.now(pytz.timezone(user.timezone)).date()


async def _to_out(
    session: AsyncSession, joint: JointHabit, viewer: User
) -> JointHabitOut:
    user_repo = UserRepository(session)
    other_id = joint.partner_id if joint.creator_id == viewer.id else joint.creator_id
    other = await user_repo.get_by_id(other_id)
    if other is None:
        raise HTTPException(404, "Partner user not found")

    role = "creator" if joint.creator_id == viewer.id else "partner"

    you_done = False
    partner_done = False
    shared_streak = 0
    if joint.status == "active":
        progress = await compute_shared_progress(session, joint, _user_today(viewer))
        if role == "creator":
            you_done = progress.creator_done_today
            partner_done = progress.partner_done_today
        else:
            you_done = progress.partner_done_today
            partner_done = progress.creator_done_today
        shared_streak = progress.shared_streak

    return JointHabitOut(
        id=joint.id,
        name=joint.name,
        emoji=joint.emoji,
        color=joint.color,
        schedule=joint.schedule,
        status=joint.status,
        created_at=joint.created_at,
        accepted_at=joint.accepted_at,
        role=role,
        partner=JointPartnerInfo(
            id=other.id,
            first_name=other.first_name,
            username=other.username,
            level=other.level,
        ),
        you_done_today=you_done,
        partner_done_today=partner_done,
        shared_streak=shared_streak,
    )


@router.get("", response_model=list[JointHabitOut])
async def list_joint_habits(
    user: User = Depends(get_active_user),
    session: AsyncSession = Depends(get_session),
) -> list[JointHabitOut]:
    """All active joint habits + pending invitations involving the user."""
    repo = JointHabitRepository(session)
    joints = await repo.list_for_user(user.id, include_pending=True)
    return [await _to_out(session, j, user) for j in joints]


@router.post("", response_model=JointHabitOut, status_code=status.HTTP_201_CREATED)
async def create(
    payload: JointHabitCreate,
    request: Request,
    user: User = Depends(get_active_user),
    session: AsyncSession = Depends(get_session),
) -> JointHabitOut:
    if payload.partner_user_id == user.id:
        raise HTTPException(400, "Нельзя создать совместную привычку с самим собой")

    # Must be friends to create joint habits together
    friendship_repo = FriendshipRepository(session)
    if not await friendship_repo.are_friends(user.id, payload.partner_user_id):
        raise HTTPException(403, "Сначала подружитесь, потом делайте общие привычки")

    name = payload.name.strip()
    if len(name) < 2:
        raise HTTPException(400, "Название слишком короткое")

    joint = await create_joint_habit(
        session=session,
        creator_id=user.id,
        partner_id=payload.partner_user_id,
        name=name,
        emoji=payload.emoji or "✅",
        schedule=payload.schedule,
        color=payload.color,
    )

    # Fire-and-forget: notify the partner in Telegram
    try:
        bot: Bot = request.app.state.bot
        user_repo = UserRepository(session)
        partner = await user_repo.get_by_id(payload.partner_user_id)
        if partner is not None:
            await bot.send_message(
                partner.telegram_id,
                (
                    f"🤝 <b>{user.first_name}</b> приглашает делать вместе:\n\n"
                    f"{joint.emoji} <b>{joint.name}</b>\n\n"
                    f"Открой Mini App → раздел Друзья → Совместные привычки.\n"
                    f"{settings.miniapp_url}"
                ),
                parse_mode="HTML",
            )
    except Exception:
        log.exception(
            "failed to notify partner about joint habit invite",
            joint_id=joint.id,
            partner_user_id=payload.partner_user_id,
        )

    return await _to_out(session, joint, user)


@router.post("/{joint_id}/accept", response_model=JointHabitOut)
async def accept(
    joint_id: int,
    request: Request,
    user: User = Depends(get_active_user),
    session: AsyncSession = Depends(get_session),
) -> JointHabitOut:
    repo = JointHabitRepository(session)
    joint = await repo.get_by_id(joint_id)
    if joint is None:
        raise HTTPException(404, "Совместная привычка не найдена")
    if joint.partner_id != user.id:
        raise HTTPException(403, "Это приглашение не для тебя")
    if joint.status != "pending":
        raise HTTPException(400, f"Уже не pending (статус: {joint.status})")

    joint, _ = await accept_joint_habit(session, joint)

    # Notify the creator
    try:
        bot: Bot = request.app.state.bot
        user_repo = UserRepository(session)
        creator = await user_repo.get_by_id(joint.creator_id)
        if creator is not None:
            await bot.send_message(
                creator.telegram_id,
                (
                    f"✅ <b>{user.first_name}</b> принял(а) приглашение!\n\n"
                    f"Совместная привычка <b>{joint.emoji} {joint.name}</b> активна. "
                    f"Теперь стрик растёт когда оба отметили."
                ),
                parse_mode="HTML",
            )
    except Exception:
        log.exception("failed to notify creator about accept", joint_id=joint.id)

    return await _to_out(session, joint, user)


@router.post("/{joint_id}/decline", response_model=JointHabitOut)
async def decline(
    joint_id: int,
    user: User = Depends(get_active_user),
    session: AsyncSession = Depends(get_session),
) -> JointHabitOut:
    repo = JointHabitRepository(session)
    joint = await repo.get_by_id(joint_id)
    if joint is None:
        raise HTTPException(404, "Не найдено")
    if joint.partner_id != user.id:
        raise HTTPException(403, "Это приглашение не для тебя")
    if joint.status != "pending":
        raise HTTPException(400, f"Уже не pending (статус: {joint.status})")

    joint = await decline_joint_habit(session, joint)
    return await _to_out(session, joint, user)


@router.delete("/{joint_id}", status_code=status.HTTP_204_NO_CONTENT)
async def leave(
    joint_id: int,
    user: User = Depends(get_active_user),
    session: AsyncSession = Depends(get_session),
) -> None:
    """Either side ends the joint habit. Personal Habit rows survive — only
    the link / agreement is closed."""
    repo = JointHabitRepository(session)
    joint = await repo.get_by_id(joint_id)
    if joint is None:
        raise HTTPException(404, "Не найдено")
    if user.id not in (joint.creator_id, joint.partner_id):
        raise HTTPException(403, "Ты не участник")

    await end_joint_habit(session, joint)
    return None
