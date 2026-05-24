from datetime import datetime
from typing import Optional, Literal

from pydantic import BaseModel, Field


JointHabitStatus = Literal["pending", "active", "declined", "ended"]


class JointHabitCreate(BaseModel):
    partner_user_id: int = Field(..., description="Internal user.id of the friend to invite")
    name: str
    emoji: str = "✅"
    color: Optional[str] = None
    schedule: dict = Field(default_factory=lambda: {"type": "daily"})


class JointPartnerInfo(BaseModel):
    id: int
    first_name: str
    username: Optional[str] = None
    level: int


class JointHabitOut(BaseModel):
    id: int
    name: str
    emoji: str
    color: Optional[str] = None
    schedule: dict
    status: JointHabitStatus
    created_at: datetime
    accepted_at: Optional[datetime] = None
    # Always shown from the viewer's perspective:
    role: Literal["creator", "partner"]
    partner: JointPartnerInfo  # the OTHER user (not the viewer)
    # Progress (only meaningful when status == "active")
    you_done_today: bool = False
    partner_done_today: bool = False
    shared_streak: int = 0
