from datetime import datetime
from typing import Optional, Literal

from pydantic import BaseModel


AccessStatusLiteral = Literal["trial", "paid", "lifetime", "expired"]
PlanLiteral = Literal["month", "lifetime"]


class AccessOut(BaseModel):
    status: AccessStatusLiteral
    trial_ends_at: Optional[datetime] = None
    paid_until: Optional[datetime] = None
    days_left: Optional[int] = None


class InvoiceRequest(BaseModel):
    plan: PlanLiteral


class InvoiceOut(BaseModel):
    invoice_link: str
    plan: PlanLiteral
    stars: int
