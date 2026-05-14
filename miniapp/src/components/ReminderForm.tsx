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
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()
    );
  };

  const canSubmit = days.length > 0 && !busy && time.length > 0;

  return (
    <div className="space-y-3 rounded-2xl bg-tg-secondary-bg p-4">
      <div>
        <p className="mb-2 text-sm font-medium text-tg-hint">Время</p>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full rounded-xl bg-tg-bg px-4 py-3 outline-none"
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-tg-hint">Дни</p>
        <div className="grid grid-cols-7 gap-1">
          {WEEKDAYS.map((name, i) => {
            const selected = days.includes(i);
            return (
              <button
                key={i}
                type="button"
                onClick={() => toggle(i)}
                className={`rounded-lg py-2 text-xs font-medium ${
                  selected ? "bg-brand-500 text-white" : "bg-tg-bg text-tg-hint"
                }`}
              >
                {name}
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => setDays([0, 1, 2, 3, 4, 5, 6])}
            className="text-xs text-tg-link"
          >
            Каждый день
          </button>
          <button
            type="button"
            onClick={() => setDays([0, 1, 2, 3, 4])}
            className="text-xs text-tg-link"
          >
            Будни
          </button>
          <button
            type="button"
            onClick={() => setDays([5, 6])}
            className="text-xs text-tg-link"
          >
            Выходные
          </button>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 rounded-xl bg-tg-bg py-2.5 text-sm font-medium"
        >
          Отмена
        </button>
        <button
          onClick={() => onSubmit(time, days)}
          disabled={!canSubmit}
          className="flex-1 rounded-xl bg-brand-500 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {busy ? "..." : "Добавить"}
        </button>
      </div>
    </div>
  );
}
