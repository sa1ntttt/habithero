from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from src.core.config import settings
from src.core.logger import setup_logging, get_logger
from src.api.routes import me, habits, stats, today, logs, reminders

log = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    log.info("HabitHero API starting", environment=settings.environment)
    yield
    log.info("HabitHero API shutting down")


app = FastAPI(
    title="HabitHero API",
    description="Backend API for the HabitHero Telegram Mini App",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.miniapp_url, "http://localhost:5173", "http://127.0.0.1:5173"],
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
