import { useState } from "react";
import { WEEKDAYS } from "../utils/schedule";

interface Props {
  onSubmit: (time: string, days: number[]) => void;
  onCancel: () => void;
  busy?: boolean;
}

export function ReminderForm({ onSubmit, onCancel, busy }: Props) {
  const [time, setTime] = useState("08:00");
  const [days, setDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);

  const toggle = (d: number) => {
    setDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort(),
    );
  };

  const canSubmit = days.length > 0 && !busy && time.length > 0;

  return (
    <div
      className="space-y-3"
      style={{
        padding: 16,
        borderRadius: 16,
        background: "#1A1A24",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div>
        <p
          style={{
            marginBottom: 8,
            fontSize: 12,
            fontWeight: 600,
            color: "#71717A",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          Время
        </p>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full px-4 py-3 outline-none focus:ring-2 focus:ring-[#8B5CF6]"
          style={{
            background: "#0A0A0F",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.95)",
            borderRadius: 12,
            fontSize: 16,
            colorScheme: "dark",
          }}
        />
      </div>

      <div>
        <p
          style={{
            marginBottom: 8,
            fontSize: 12,
            fontWeight: 600,
            color: "#71717A",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          Дни
        </p>
        <div className="grid grid-cols-7 gap-1">
          {WEEKDAYS.map((name, i) => {
            const selected = days.includes(i);
            return (
              <button
                key={i}
                type="button"
                onClick={() => toggle(i)}
                className="rounded-lg py-2 text-xs font-medium"
                style={{
                  background: selected
                    ? "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)"
                    : "#0A0A0F",
                  border: "1px solid rgba(255,255,255,0.05)",
                  color: selected ? "white" : "#A1A1AA",
                }}
              >
                {name}
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex gap-3">
          <button
            type="button"
            onClick={() => setDays([0, 1, 2, 3, 4, 5, 6])}
            className="bg-transparent border-0 p-0 cursor-pointer"
            style={{ color: "#A78BFA", fontSize: 12 }}
          >
            Каждый день
          </button>
          <button
            type="button"
            onClick={() => setDays([0, 1, 2, 3, 4])}
            className="bg-transparent border-0 p-0 cursor-pointer"
            style={{ color: "#A78BFA", fontSize: 12 }}
          >
            Будни
          </button>
          <button
            type="button"
            onClick={() => setDays([5, 6])}
            className="bg-transparent border-0 p-0 cursor-pointer"
            style={{ color: "#A78BFA", fontSize: 12 }}
          >
            Выходные
          </button>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 text-sm font-medium"
          style={{
            borderRadius: 12,
            background: "#0A0A0F",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.95)",
            cursor: "pointer",
          }}
        >
          Отмена
        </button>
        <button
          onClick={() => onSubmit(time, days)}
          disabled={!canSubmit}
          className="flex-1 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          style={{
            borderRadius: 12,
            background: "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
            boxShadow: canSubmit
              ? "0 4px 12px -2px rgba(139,92,246,0.4)"
              : "none",
            cursor: canSubmit ? "pointer" : "default",
          }}
        >
          {busy ? "..." : "Добавить"}
        </button>
      </div>
    </div>
  );
}
