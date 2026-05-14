from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

# Project root: habit-bot/ (parent of backend/)
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent
ENV_FILE = PROJECT_ROOT / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Telegram
    bot_token: str

    # Database
    database_url: str

    # FastAPI
    secret_key: str = "change_me"
    miniapp_url: str = "http://localhost:5173"

    # Gemini AI
    gemini_api_key: str = ""

    # App
    debug: bool = False
    log_level: str = "INFO"
    environment: str = "development"


settings = Settings()
