import { useState } from "react";
import type { HabitOut, HabitLogOut } from "../types/api";

interface Props {
  habit: HabitOut;
  log: HabitLogOut | null;
  onClose: () => void;
  onIncrement: (value: number) => Promise<void>;
  onReset: () => Promise<void>;
}

function fmt(n: number): string {
  return n === Math.floor(n) ? String(n) : n.toFixed(1);
}

export function ValueModal({ habit, log, onClose, onIncrement, onReset }: Props) {
  const target = habit.target_value ?? 0;
  const current = log?.value ?? 0;
  const unit = habit.unit ?? "";
  const done = log?.status === "done";
  const progress = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  const bigStep = target >= 4 ? Math.max(2, Math.floor(target / 4)) : 0;

  const [customInput, setCustomInput] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const handleAdd = async (n: number) => {
    if (busy || n <= 0) return;
    setBusy(true);
    try {
      await onIncrement(n);
    } finally {
      setBusy(false);
    }
  };

  const handleAddCustom = async () => {
    const n = Number(customInput.replace(",", "."));
    if (!Number.isFinite(n) || n <= 0) return;
    await handleAdd(n);
    setCustomInput("");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-3xl bg-tg-bg p-5 pb-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-tg-hint/40" />

        <div className="flex items-center gap-3">
          <span className="text-4xl">{habit.emoji}</span>
          <div className="flex-1">
            <h2 className="text-lg font-bold">{habit.name}</h2>
            <p className="text-sm text-tg-hint">
              {fmt(current)} / {fmt(target)} {unit}
              {done && " · 🎉"}
            </p>
          </div>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-tg-secondary-bg">
          <div
            className={`h-full transition-all ${done ? "bg-emerald-500" : "bg-brand-500"}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            disabled={busy}
            onClick={() => handleAdd(1)}
            className="rounded-xl bg-brand-500 py-3 font-semibold text-white disabled:opacity-50"
          >
            +1 {unit}
          </button>
          {bigStep > 1 && (
            <button
              disabled={busy}
              onClick={() => handleAdd(bigStep)}
              className="rounded-xl bg-brand-500 py-3 font-semibold text-white disabled:opacity-50"
            >
              +{bigStep} {unit}
            </button>
          )}
        </div>

        <div className="mt-2 flex gap-2">
          <input
            type="number"
            inputMode="decimal"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Своё значение"
            className="flex-1 rounded-xl bg-tg-secondary-bg px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            disabled={busy || !customInput}
            onClick={handleAddCustom}
            className="rounded-xl bg-brand-500 px-4 font-semibold text-white disabled:opacity-50"
          >
            +
          </button>
        </div>

        <button
          disabled={busy}
          onClick={onReset}
          className="mt-3 w-full rounded-xl bg-tg-secondary-bg py-3 text-sm font-medium disabled:opacity-50"
        >
          🔄 Сбросить за сегодня
        </button>

        <button
          onClick={onClose}
          className="mt-2 w-full rounded-xl bg-tg-secondary-bg py-3 text-sm text-tg-hint"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
}
