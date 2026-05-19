from aiogram import Router
from aiogram.filters import Command
from aiogram.types import Message
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.config import settings
from src.db.repositories.user_repo import UserRepository
from src.db.repositories.friendship_repo import FriendshipRepository

router = Router()


def _bot_username() -> str:
    """Best-effort bot username. Override via env if needed."""
    # We rely on the bot's user data in main; pass via settings if needed.
    # For now, take a hardcoded fallback (works because user knows their bot).
    return "my_hab1ts_tracker_bot"


@router.message(Command("invite"))
async def cmd_invite(message: Message, session: AsyncSession) -> None:
    repo = UserRepository(session)
    user = await repo.get_by_telegram_id(message.from_user.id)
    if not user:
        await message.answer("Сначала /start")
        return

    bot_username = _bot_username()
    link = f"https://t.me/{bot_username}?start=friend_{user.id}"

    await message.answer(
        "🤝 <b>Пригласи друга</b>\n\n"
        "Поделись этой ссылкой — кто перейдёт по ней, станет твоим другом в HabitHero:\n\n"
        f"<code>{link}</code>\n\n"
        "Друзья увидят ленту твоих успехов, а ты — их 💪",
        parse_mode="HTML",
        disable_web_page_preview=True,
    )


@router.message(Command("friends"))
async def cmd_friends(message: Message, session: AsyncSession) -> None:
    repo = UserRepository(session)
    user = await repo.get_by_telegram_id(message.from_user.id)
    if not user:
        await message.answer("Сначала /start")
        return

    friendship_repo = FriendshipRepository(session)
    friends = await friendship_repo.list_friends(user.id)

    if not friends:
        await message.answer(
            "У тебя пока нет друзей в HabitHero 😔\n\n"
            "Пригласи кого-нибудь через /invite — поделись ссылкой, "
            "и кто перейдёт по ней, добавится в твой список друзей."
        )
        return

    lines = [f"👥 <b>Друзей: {len(friends)}</b>\n"]
    for f in friends:
        username_part = f" (@{f.username})" if f.username else ""
        lines.append(
            f"• <b>{f.first_name}</b>{username_part} — ⭐ ур. {f.level} · 🎯 {f.total_xp} XP"
        )
    lines.append("\nЛента активности друзей доступна в Mini App 📱")

    await message.answer("\n".join(lines), parse_mode="HTML")
