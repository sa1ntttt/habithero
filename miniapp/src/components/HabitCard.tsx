import type { HabitOut, HabitLogOut } from "../types/api";

interface HabitCardProps {
  habit: HabitOut;
  log?: HabitLogOut | null;
  busy?: boolean;
  onClick?: () => void;
}

function fmt(n: number): string {
  return n === Math.floor(n) ? String(n) : n.toFixed(1);
}

export function HabitCard({ habit, log, busy = false, onClick }: HabitCardProps) {
  const streak = habit.streak?.current_streak ?? 0;
  const isQuantity =
    (habit.type === "quantity" || habit.type === "timer") && habit.target_value != null;
  const done = log?.status === "done";

  const currentValue = log?.value ?? 0;
  const target = habit.target_value ?? 0;
  const progress = target > 0 ? Math.min(100, Math.round((currentValue / target) * 100)) : 0;

  return (
    <button
      type="button"
      disabled={busy}
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl p-4 text-left transition active:scale-[0.98] disabled:opacity-60 ${
        done ? "bg-emerald-500/15" : "bg-tg-secondary-bg"
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-2xl ${
          done ? "bg-emerald-500 text-white" : "bg-tg-bg"
        }`}
      >
        {done ? "✓" : habit.emoji}
      </span>

      <div className="flex-1 min-w-0">
        <p className={`font-semibold ${done ? "line-through opacity-70" : ""}`}>
          {habit.name}
        </p>
        {isQuantity ? (
          <>
            <div className="mt-1 flex items-center justify-between gap-2">
              <span className="text-xs text-tg-hint">
                {fmt(currentValue)} / {fmt(target)} {habit.unit || ""}
              </span>
              {streak > 0 && (
                <span className="text-xs text-orange-500">🔥 {streak}</span>
              )}
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-tg-bg">
              <div
                className={`h-full transition-all ${
                  done ? "bg-emerald-500" : "bg-brand-500"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
        ) : (
          streak > 0 && (
            <p className="text-xs text-tg-hint">🔥 {streak} дней подряд</p>
          )
        )}
      </div>

      {!isQuantity && <span className="text-2xl">{done ? "" : habit.emoji}</span>}
    </button>
  );
}
