const WEEKDAY_NAMES = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export function schedulePreview(schedule: Record<string, unknown>): string {
  const type = (schedule?.type as string) || "daily";

  if (type === "daily") return "Каждый день";

  if (type === "weekdays") {
    const days = (schedule.days as number[]) || [];
    if (days.length === 0) return "Без расписания";
    const sorted = [...days].sort();
    if (sorted.join(",") === "0,1,2,3,4") return "По будням";
    if (sorted.join(",") === "5,6") return "По выходным";
    return sorted.map((d) => WEEKDAY_NAMES[d]).join(", ");
  }

  if (type === "every_n_days") {
    const n = schedule.n as number;
    return `Каждые ${n} дн.`;
  }

  if (type === "times_per_week") {
    const count = schedule.count as number;
    return `${count}× в неделю`;
  }

  return "Без расписания";
}

export const WEEKDAYS = WEEKDAY_NAMES;
