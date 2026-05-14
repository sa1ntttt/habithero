import type { HabitOut } from "../types/api";

interface HabitCardProps {
  habit: HabitOut;
  done?: boolean;
  busy?: boolean;
  onClick?: () => void;
}

export function HabitCard({ habit, done = false, busy = false, onClick }: HabitCardProps) {
  const streak = habit.streak?.current_streak ?? 0;
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

      <div className="flex-1">
        <p className={`font-semibold ${done ? "line-through opacity-70" : ""}`}>
          {habit.name}
        </p>
        {streak > 0 && (
          <p className="text-xs text-tg-hint">🔥 {streak} дней подряд</p>
        )}
      </div>

      <span className="text-2xl">{done ? "" : habit.emoji}</span>
    </button>
  );
}
