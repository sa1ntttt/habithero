from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    telegram_id: int
    username: Optional[str] = None
    first_name: str
    timezone: str
    language: str
    level: int
    total_xp: int
    xp_to_next_level: int = 0
    xp_in_current_level: int = 0
    xp_for_current_level: int = 0
    created_at: datetime


class UserUpdate(BaseModel):
    timezone: Optional[str] = None
    language: Optional[str] = None
