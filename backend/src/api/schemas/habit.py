from datetime import datetime, date
from typing import Optional, Literal, Union
from pydantic import BaseModel, ConfigDict, Field

from src.db.models.habit import HabitType
from src.db.models.habit_log import LogStatus


class ScheduleDaily(BaseModel):
    type: Literal["daily"] = "daily"


class ScheduleWeekdays(BaseModel):
    type: Literal["weekdays"] = "weekdays"
    days: list[int] = Field(..., description="0=Mon ... 6=Sun")


class ScheduleTimesPerWeek(BaseModel):
    type: Literal["times_per_week"] = "times_per_week"
    count: int = Field(..., ge=1, le=7)


class ScheduleEveryNDays(BaseModel):
    type: Literal["every_n_days"] = "every_n_days"
    n: int = Field(..., ge=2, le=30)


Schedule = Union[ScheduleDaily, ScheduleWeekdays, ScheduleTimesPerWeek, ScheduleEveryNDays]


class StreakOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    current_streak: int = 0
    longest_streak: int = 0
    last_check_date: Optional[date] = None
    freezes_available: int = 2


class HabitOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: Optional[str] = None
    emoji: str
    color: str
    type: HabitType
    target_value: Optional[float] = None
    unit: Optional[str] = None
    schedule: dict
    is_archived: bool
    created_at: datetime
    streak: Optional[StreakOut] = None


class HabitCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=128)
    description: Optional[str] = Field(None, max_length=512)
    emoji: str = Field("✅", max_length=8)
    color: str = "#6366f1"
    type: HabitType = HabitType.binary
    target_value: Optional[float] = None
    unit: Optional[str] = None
    schedule: dict = Field(default_factory=lambda: {"type": "daily"})


class HabitUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=128)
    description: Optional[str] = Field(None, max_length=512)
    emoji: Optional[str] = Field(None, max_length=8)
    color: Optional[str] = None
    schedule: Optional[dict] = None
    is_archived: Optional[bool] = None


class HabitLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    habit_id: int
    log_date: date
    value: Optional[float] = None
    status: LogStatus
    note: Optional[str] = None
    created_at: datetime


class CheckinRequest(BaseModel):
    log_date: Optional[date] = None  # defaults to "today" in user's timezone
    value: Optional[float] = None
    note: Optional[str] = Field(None, max_length=512)


class AchievementUnlockOut(BaseModel):
    code: str
    name: str
    icon: str
    description: str
    xp_reward: int


class CheckinResponse(BaseModel):
    log: HabitLogOut
    streak: StreakOut
    streak_grew: bool
    freezes_used: int
    xp_earned: int = 0
    level: int = 1
    level_up: bool = False
    new_achievements: list[AchievementUnlockOut] = []
