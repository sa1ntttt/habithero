from pydantic import BaseModel


class OverallStats(BaseModel):
    total_habits: int
    active_habits: int
    total_checkins: int
    longest_streak: int
    current_active_streaks: int
