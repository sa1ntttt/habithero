from typing import Optional
from pydantic import BaseModel, ConfigDict


class FriendOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    first_name: str
    username: Optional[str] = None
    level: int
    total_xp: int
