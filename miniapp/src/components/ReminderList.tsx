import type { ReminderOut } from "../types/api";
import { WEEKDAYS } from "../utils/schedule";

interface Props {
  reminders: ReminderOut[];
  onToggle: (r: ReminderOut) => void;
  onDelete: (r: ReminderOut) => void;
}

function daysText(days: number[]): string {
  const sorted = [...days].sort();
  if (sorted.join(",") === "0,1,2,3,4,5,6") return "ежедневно";
  if (sorted.join(",") === "0,1,2,3,4") return "будни";
  if (sorted.join(",") === "5,6") return "выходные";
  return sorted.map((d) => WEEKDAYS[d]).join(", ");
}

function formatTime(t: string): string {
  // Backend sends "HH:MM:SS"; show "HH:MM"
  return t.slice(0, 5);
}

export function ReminderList({ reminders, onToggle, onDelete }: Props) {
  if (reminders.length === 0) {
    return (
      <p className="text-sm text-tg-hint">
        Напоминаний пока нет. Добавь первое — бот будет писать тебе в нужное время.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {reminders.map((r) => (
        <li
          key={r.id}
          className="flex items-center gap-3 rounded-xl bg-tg-secondary-bg p-3"
        >
          <button
            onClick={() => onToggle(r)}
            className="text-2xl"
            title={r.is_active ? "Выключить" : "Включить"}
          >
            {r.is_active ? "🔔" : "🔕"}
          </button>
          <div className="flex-1">
            <p className={`font-semibold ${!r.is_active ? "opacity-50" : ""}`}>
              {formatTime(r.time)}
            </p>
            <p className="text-xs text-tg-hint">{daysText(r.days_of_week)}</p>
          </div>
          <button
            onClick={() => onDelete(r)}
            className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600"
          >
            🗑
          </button>
        </li>
      ))}
    </ul>
  );
}
