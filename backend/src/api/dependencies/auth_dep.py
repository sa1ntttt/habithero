from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.config import settings
from src.core.security import validate_init_data, InitDataValidationError
from src.core.logger import get_logger
from src.api.dependencies.db_dep import get_session
from src.db.models.user import User
from src.db.repositories.user_repo import UserRepository
from src.services.access_service import get_access_status

log = get_logger(__name__)


async def get_current_user(
    init_data: str = Header(
        ...,
        alias="X-Telegram-Init-Data",
        description="Raw Telegram WebApp initData string",
    ),
    session: AsyncSession = Depends(get_session),
) -> User:
    """Validate Telegram initData and return (or create) the corresponding User.

    The Mini App must send this header on every request. We never trust
    a user_id sent in the request body.
    """
    try:
        tg_user = validate_init_data(init_data, settings.bot_token)
    except InitDataValidationError as e:
        log.warning("init_data validation failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Telegram initData: {e}",
        )

    user_repo = UserRepository(session)
    user, created = await user_repo.get_or_create(
        telegram_id=tg_user["id"],
        first_name=tg_user.get("first_name", ""),
        username=tg_user.get("username"),
    )
    if created:
        log.info("user auto-registered via Mini App", telegram_id=tg_user["id"])
    return user


async def get_active_user(user: User = Depends(get_current_user)) -> User:
    """Same as get_current_user, but rejects users with expired access.

    Used on every endpoint that should be gated behind trial / paid sub.
    Returns 402 Payment Required so the frontend can distinguish this
    from 401 (auth) and show the paywall.
    """
    access = get_access_status(user)
    if not access.is_active:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=f"Subscription required (status: {access.status})",
        )
    return user
