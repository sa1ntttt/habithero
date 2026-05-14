from datetime import date, timedelta
from src.db.models.habit import Habit


WEEKDAY_NAMES_RU = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]
WEEKDAY_FULL_RU = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"]


def is_scheduled_for_date(habit: Habit, target_date: date) -> bool:
    schedule = habit.schedule or {"type": "daily"}
    stype = schedule.get("type", "daily")

    if stype == "daily":
        return True

    if stype == "weekdays":
        days = schedule.get("days", [])
        return target_date.weekday() in days

    if stype == "every_n_days":
        n = schedule.get("n", 1)
        if n <= 0:
            return True
        start = habit.created_at.date() if habit.created_at else target_date
        delta = (target_date - start).days
        return delta >= 0 and delta % n == 0

    if stype == "times_per_week":
        # Always show the habit; the user picks any days they want during the week
        return True

    return True


def count_scheduled_days_between(habit: Habit, after: date, before: date) -> int:
    """Count scheduled days strictly between two dates (after < d < before)."""
    if before <= after + timedelta(days=1):
        return 0
    count = 0
    current = after + timedelta(days=1)
    while current < before:
        if is_scheduled_for_date(habit, current):
            count += 1
        current += timedelta(days=1)
    return count


def schedule_human_text(schedule: dict) -> str:
    stype = schedule.get("type", "daily")

    if stype == "daily":
        return "Каждый день"

    if stype == "weekdays":
        days = schedule.get("days", [])
        if not days:
            return "Без расписания"
        if set(days) == {0, 1, 2, 3, 4}:
            return "По будням (Пн–Пт)"
        if set(days) == {5, 6}:
            return "По выходным (Сб–Вс)"
        names = ", ".join(WEEKDAY_NAMES_RU[d] for d in sorted(days))
        return f"По дням: {names}"

    if stype == "every_n_days":
        n = schedule.get("n", 1)
        return f"Каждые {n} дн."

    if stype == "times_per_week":
        n = schedule.get("count", 1)
        return f"{n} раз в неделю"

    return "Без расписания"
