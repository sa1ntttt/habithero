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
  return t.slice(0, 5);
}

export function ReminderList({ reminders, onToggle, onDelete }: Props) {
  if (reminders.length === 0) {
    return (
      <div
        className="px-4 py-3"
        style={{
          background: "#1A1A24",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 14,
        }}
      >
        <p style={{ fontSize: 13, color: "#A1A1AA", lineHeight: 1.4 }}>
          Напоминаний пока нет. Добавь первое — бот будет писать тебе в нужное время.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {reminders.map((r) => (
        <div
          key={r.id}
          className="flex items-center gap-3"
          style={{
            padding: "12px 14px",
            borderRadius: 14,
            background: "#1A1A24",
            border: "1px solid rgba(255,255,255,0.08)",
            opacity: r.is_active ? 1 : 0.55,
            transition: "opacity 200ms ease",
          }}
        >
          <button
            onClick={() => onToggle(r)}
            className="flex shrink-0 items-center justify-center"
            style={{
              width: 36,
              height: 36,
              borderRadius: 11,
              background: r.is_active
                ? "rgba(139,92,246,0.16)"
                : "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.05)",
              cursor: "pointer",
            }}
            title={r.is_active ? "Выключить" : "Включить"}
          >
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              {r.is_active ? (
                <path
                  d="M6 9a6 6 0 1 1 12 0c0 4.5 2 5.5 2 7H4c0-1.5 2-2.5 2-7Zm4 11a2 2 0 0 0 4 0"
                  stroke="#A78BFA"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : (
                <>
                  <path
                    d="M6 9a6 6 0 0 1 9-5.2M18 9c0 4.5 2 5.5 2 7H6"
                    stroke="#71717A"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M4 4l16 16"
                    stroke="#71717A"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </>
              )}
            </svg>
          </button>
          <div className="min-w-0 flex-1">
            <div
              style={{
                fontSize: 17,
                fontWeight: 600,
                color: "rgba(255,255,255,0.95)",
                fontVariantNumeric: "tabular-nums",
                letterSpacing: "-0.01em",
              }}
            >
              {formatTime(r.time)}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#A1A1AA",
                marginTop: 1,
              }}
            >
              {daysText(r.days_of_week)}
            </div>
          </div>
          <button
            onClick={() => onDelete(r)}
            className="flex shrink-0 items-center justify-center"
            style={{
              width: 36,
              height: 36,
              borderRadius: 11,
              background: "rgba(239,68,68,0.10)",
              border: "1px solid rgba(239,68,68,0.18)",
              cursor: "pointer",
            }}
            title="Удалить"
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <path
                d="M4 7h16M9 7V4h6v3M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13"
                stroke="#F87171"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
