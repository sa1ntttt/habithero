import { useEffect, useRef, useState } from "react";
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

function formatElapsed(seconds: number): string {
  const mm = Math.floor(seconds / 60);
  const ss = Math.floor(seconds % 60);
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

export function ValueModal({ habit, log, onClose, onIncrement, onReset }: Props) {
  const isTimer = habit.type === "timer";
  const target = habit.target_value ?? 0;
  const current = log?.value ?? 0;
  const unit = habit.unit ?? (isTimer ? "мин" : "");
  const done = log?.status === "done";
  const progress = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  const bigStep = target >= 4 ? Math.max(2, Math.floor(target / 4)) : 0;

  const [customInput, setCustomInput] = useState<string>("");
  const [busy, setBusy] = useState(false);

  // Timer state (in-memory only)
  const [timerStartedAt, setTimerStartedAt] = useState<number | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    if (timerStartedAt == null) return;
    tickRef.current = window.setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - timerStartedAt) / 1000));
    }, 250);
    return () => {
      if (tickRef.current != null) window.clearInterval(tickRef.current);
    };
  }, [timerStartedAt]);

  const startTimer = () => {
    setElapsedSec(0);
    setTimerStartedAt(Date.now());
  };

  const stopTimer = async () => {
    if (timerStartedAt == null) return;
    const elapsedMinutes = Math.max(1, Math.round((Date.now() - timerStartedAt) / 60000));
    setTimerStartedAt(null);
    setElapsedSec(0);
    await handleAdd(elapsedMinutes);
  };

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

        {isTimer && (
          <div className="mt-5">
            {timerStartedAt == null ? (
              <button
                disabled={busy}
                onClick={startTimer}
                className="w-full rounded-2xl bg-emerald-500 py-6 text-2xl font-bold text-white shadow-lg disabled:opacity-50"
              >
                ▶️ Запустить таймер
              </button>
            ) : (
              <div className="rounded-2xl bg-tg-secondary-bg p-5 text-center">
                <p className="text-4xl font-mono font-bold tabular-nums">
                  {formatElapsed(elapsedSec)}
                </p>
                <p className="mt-1 text-xs text-tg-hint">идёт отсчёт…</p>
                <button
                  disabled={busy}
                  onClick={stopTimer}
                  className="mt-3 w-full rounded-xl bg-red-500 py-3 font-semibold text-white disabled:opacity-50"
                >
                  ⏸ Остановить и засчитать
                </button>
              </div>
            )}
            <p className="mt-3 text-center text-xs text-tg-hint">— или добавь вручную ниже —</p>
          </div>
        )}

        <div className="mt-5 grid grid-cols-3 gap-2">
          <button
            disabled={busy}
            onClick={() => handleAdd(isTimer ? 5 : 1)}
            className="rounded-xl bg-brand-500 py-3 font-semibold text-white disabled:opacity-50"
          >
            +{isTimer ? 5 : 1} {unit}
          </button>
          <button
            disabled={busy}
            onClick={() => handleAdd(isTimer ? 10 : Math.max(1, bigStep))}
            className="rounded-xl bg-brand-500 py-3 font-semibold text-white disabled:opacity-50"
          >
            +{isTimer ? 10 : Math.max(1, bigStep)} {unit}
          </button>
          <button
            disabled={busy}
            onClick={() => handleAdd(isTimer ? 15 : Math.max(1, bigStep * 2))}
            className="rounded-xl bg-brand-500 py-3 font-semibold text-white disabled:opacity-50"
          >
            +{isTimer ? 15 : Math.max(1, bigStep * 2)} {unit}
          </button>
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
