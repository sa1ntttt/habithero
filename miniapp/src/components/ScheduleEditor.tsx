import { WEEKDAYS } from "../utils/schedule";

export type ScheduleValue =
  | { type: "daily" }
  | { type: "weekdays"; days: number[] }
  | { type: "times_per_week"; count: number }
  | { type: "every_n_days"; n: number };

interface Props {
  value: ScheduleValue;
  onChange: (value: ScheduleValue) => void;
}

export function ScheduleEditor({ value, onChange }: Props) {
  const type = value.type;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <TypeBtn active={type === "daily"} onClick={() => onChange({ type: "daily" })}>
          📅 Каждый день
        </TypeBtn>
        <TypeBtn
          active={type === "weekdays"}
          onClick={() => onChange({ type: "weekdays", days: [1, 3, 5] })}
        >
          📆 По дням
        </TypeBtn>
        <TypeBtn
          active={type === "times_per_week"}
          onClick={() => onChange({ type: "times_per_week", count: 3 })}
        >
          🔢 X в неделю
        </TypeBtn>
        <TypeBtn
          active={type === "every_n_days"}
          onClick={() => onChange({ type: "every_n_days", n: 2 })}
        >
          ⏰ Каждые N дней
        </TypeBtn>
      </div>

      {type === "weekdays" && (
        <div className="grid grid-cols-7 gap-1">
          {WEEKDAYS.map((name, i) => {
            const selected = value.days.includes(i);
            return (
              <button
                key={i}
                type="button"
                onClick={() => {
                  const next = selected
                    ? value.days.filter((d) => d !== i)
                    : [...value.days, i].sort();
                  onChange({ type: "weekdays", days: next });
                }}
                className="rounded-lg py-2 text-xs font-medium"
                style={{
                  background: selected
                    ? "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)"
                    : "#1A1A24",
                  border: "1px solid rgba(255,255,255,0.05)",
                  color: selected ? "white" : "#A1A1AA",
                }}
              >
                {name}
              </button>
            );
          })}
        </div>
      )}

      {type === "times_per_week" && (
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange({ type: "times_per_week", count: n })}
              className="flex-1 rounded-lg py-2 text-sm font-medium"
              style={{
                background:
                  value.count === n
                    ? "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)"
                    : "#1A1A24",
                border: "1px solid rgba(255,255,255,0.05)",
                color: value.count === n ? "white" : "#A1A1AA",
              }}
            >
              {n}×
            </button>
          ))}
        </div>
      )}

      {type === "every_n_days" && (
        <div className="flex flex-wrap gap-1">
          {[2, 3, 4, 5, 7, 10, 14].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange({ type: "every_n_days", n })}
              className="rounded-lg px-3 py-2 text-sm font-medium"
              style={{
                background:
                  value.n === n
                    ? "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)"
                    : "#1A1A24",
                border: "1px solid rgba(255,255,255,0.05)",
                color: value.n === n ? "white" : "#A1A1AA",
              }}
            >
              {n} дн
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TypeBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl px-3 py-3 text-sm font-medium"
      style={{
        background: active
          ? "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)"
          : "#1A1A24",
        border: "1px solid rgba(255,255,255,0.05)",
        color: active ? "white" : "rgba(255,255,255,0.95)",
        boxShadow: active ? "0 4px 12px -2px rgba(139,92,246,0.3)" : "none",
      }}
    >
      {children}
    </button>
  );
}
