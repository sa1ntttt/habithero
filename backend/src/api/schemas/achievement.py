from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class AchievementOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    name: str
    description: str
    icon: str
    xp_reward: int
    category: str
    requirement_value: int
    unlocked: bool = False
    unlocked_at: Optional[datetime] = None
