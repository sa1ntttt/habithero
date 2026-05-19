from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class FeedItem(BaseModel):
    id: int
    user_id: int
    user_name: str
    user_first_name: str
    event_type: str  # 'checkin' | 'achievement' | 'level_up'
    payload: dict
    created_at: datetime
