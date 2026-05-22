"""Stars payments endpoints — invoice creation only.

Successful payments come back through the bot (Telegram pushes the
`successful_payment` event), not through HTTP. See src/bot/handlers/payments.py.
"""
from aiogram import Bot
from fastapi import APIRouter, Depends, HTTPException, Request, status

from src.api.dependencies.auth_dep import get_current_user
from src.api.schemas.access import InvoiceOut, InvoiceRequest
from src.core.logger import get_logger
from src.db.models.user import User
from src.services.payment_service import create_stars_invoice_link, get_plan

router = APIRouter(prefix="/api/payments", tags=["payments"])
log = get_logger(__name__)


@router.post("/invoice", response_model=InvoiceOut)
async def create_invoice(
    payload: InvoiceRequest,
    request: Request,
    user: User = Depends(get_current_user),
) -> InvoiceOut:
    plan = get_plan(payload.plan)
    if plan is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown plan: {payload.plan}",
        )

    bot: Bot = request.app.state.bot
    try:
        link = await create_stars_invoice_link(bot, user.id, plan)
    except Exception as e:
        log.exception("failed to create Stars invoice", plan=plan.code, user_id=user.id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not create invoice: {e}",
        )

    log.info(
        "stars invoice created",
        user_id=user.id,
        plan=plan.code,
        stars=plan.stars,
    )
    return InvoiceOut(invoice_link=link, plan=plan.code, stars=plan.stars)
