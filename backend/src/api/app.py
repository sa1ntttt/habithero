import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from src.core.config import settings
from src.core.logger import setup_logging, get_logger
from src.api.routes import (
    me,
    habits,
    stats,
    today,
    logs,
    reminders,
    achievements,
    friends,
    feed,
    payments,
)
from src.bot.setup import create_bot_and_dispatcher
from src.scheduler.scheduler import create_scheduler

log = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    log.info("HabitHero API starting", environment=settings.environment)

    # --- Start bot polling + scheduler in the same process ---
    bot, dp = create_bot_and_dispatcher()
    scheduler = create_scheduler(bot)
    scheduler.start()
    log.info("scheduler started")

    await bot.delete_webhook(drop_pending_updates=True)
    bot_task = asyncio.create_task(dp.start_polling(bot, handle_signals=False))
    log.info("bot polling started inside API process")

    # Make accessible to handlers/tests if needed
    app.state.bot = bot
    app.state.dispatcher = dp
    app.state.scheduler = scheduler

    try:
        yield
    finally:
        log.info("HabitHero API shutting down")
        # Stop bot polling cleanly
        await dp.stop_polling()
        bot_task.cancel()
        try:
            await bot_task
        except (asyncio.CancelledError, Exception):
            pass
        scheduler.shutdown(wait=False)
        await bot.session.close()
        log.info("bot + scheduler stopped")


app = FastAPI(
    title="HabitHero API",
    description="Backend API for the HabitHero Telegram Mini App",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.miniapp_url, "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_origin_regex=r"https://([a-zA-Z0-9-]+\.)*(vercel\.app|lhr\.life|trycloudflare\.com|loca\.lt)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    log.exception("unhandled API error", path=request.url.path)
    detail = str(exc) if settings.debug else "internal server error"
    return JSONResponse(status_code=500, content={"detail": detail})


@app.get("/health", tags=["system"])
async def health() -> dict:
    return {"status": "ok"}


app.include_router(me.router)
app.include_router(habits.router)
app.include_router(stats.router)
app.include_router(today.router)
app.include_router(logs.router)
app.include_router(reminders.router)
app.include_router(achievements.router)
app.include_router(friends.router)
app.include_router(feed.router)
app.include_router(payments.router)
