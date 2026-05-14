from datetime import time, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class ReminderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    habit_id: int
    time: time
    days_of_week: list[int]
    is_active: bool
    last_sent_at: Optional[datetime] = None
    created_at: datetime


class ReminderCreate(BaseModel):
    time: time
    days_of_week: list[int] = Field(default_factory=lambda: [0, 1, 2, 3, 4, 5, 6])
    is_active: bool = True


class ReminderUpdate(BaseModel):
    time: Optional[time] = None
    days_of_week: Optional[list[int]] = None
    is_active: Optional[bool] = None
