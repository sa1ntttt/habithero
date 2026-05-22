"""Subscription / trial access logic.

Status meaning:
- trial:    user is within the 14-day trial window after registration
- paid:     paid_until is set and in the future (but not lifetime)
- lifetime: paid_until is far-future (2099+) — granted to founders or
            via the lifetime purchase
- expired:  trial ended AND no active paid subscription
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Optional

from src.db.models.user import User


TRIAL_DAYS = 14
# paid_until at-or-after this timestamp is treated as lifetime.
LIFETIME_THRESHOLD = datetime(2099, 1, 1, tzinfo=timezone.utc)


@dataclass(frozen=True)
class AccessStatus:
    status: str  # "trial" | "paid" | "lifetime" | "expired"
    trial_ends_at: Optional[datetime]
    paid_until: Optional[datetime]
    days_left: Optional[int]

    @property
    def is_active(self) -> bool:
        return self.status in ("trial", "paid", "lifetime")


def _as_utc(dt: datetime) -> datetime:
    """Ensure datetime is timezone-aware (UTC). Some DBs return naive datetimes."""
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


def get_access_status(user: User, now: Optional[datetime] = None) -> AccessStatus:
    """Compute the user's current subscription status.

    Pure function — no DB calls. Caller must pass a fresh User object.
    """
    if now is None:
        now = datetime.now(tz=timezone.utc)

    paid_until = user.paid_until
    if paid_until is not None:
        paid_until = _as_utc(paid_until)

    created_at = _as_utc(user.created_at)
    trial_ends_at = created_at + timedelta(days=TRIAL_DAYS)

    # Lifetime — paid_until is in the far future
    if paid_until is not None and paid_until >= LIFETIME_THRESHOLD:
        return AccessStatus(
            status="lifetime",
            trial_ends_at=None,
            paid_until=paid_until,
            days_left=None,
        )

    # Active paid sub
    if paid_until is not None and paid_until > now:
        days_left = max(0, (paid_until - now).days)
        return AccessStatus(
            status="paid",
            trial_ends_at=None,
            paid_until=paid_until,
            days_left=days_left,
        )

    # Trial still going
    if trial_ends_at > now:
        days_left = max(0, (trial_ends_at - now).days)
        return AccessStatus(
            status="trial",
            trial_ends_at=trial_ends_at,
            paid_until=None,
            days_left=days_left,
        )

    # Trial expired AND no active sub
    return AccessStatus(
        status="expired",
        trial_ends_at=trial_ends_at,
        paid_until=paid_until,
        days_left=0,
    )
