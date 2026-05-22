import type { HabitOut, HabitLogOut } from "../types/api";
import { CardSurface } from "./ui/CardSurface";
import { HabitIcon } from "./ui/HabitIcon";
import { CheckCircle } from "./ui/CheckCircle";
import { PlusButton } from "./ui/PlusButton";
import { Bar } from "./ui/Bar";
import { FireChip } from "./ui/FireChip";

type Props = {
  habit: HabitOut;
  log?: HabitLogOut | null;
  busy?: boolean;
  /** Tap on the card body. For quantity habits, parent opens a precise-value modal. */
  onClick?: () => void;
  /** Tap on the inline + button (quantity habits only). */
  onIncrement?: () => void;
  /** Tap on the check circle (binary habits only). */
  onToggle?: () => void;
};

function fmt(n: number): string {
  return n === Math.floor(n) ? String(n) : n.toFixed(1);
}

export function HabitCard({
  habit,
  log,
  busy = false,
  onClick,
  onIncrement,
  onToggle,
}: Props) {
  const streak = habit.streak?.current_streak ?? 0;
  const isQuantity = habit.type === "quantity" && habit.target_value != null;
  const currentValue = log?.value ?? 0;
  const target = habit.target_value ?? 0;
  const qFull = isQuantity && currentValue >= target;
  const binaryDone = !isQuantity && log?.status === "done";
  const cardDone = binaryDone || qFull;
  const showStreak = streak >= 5 && !cardDone;

  return (
    <CardSurface
      style={{
        padding: 12,
        background: cardDone
          ? "linear-gradient(135deg, rgba(16,185,129,0.06), rgba(5,150,105,0.02)), #1A1A24"
          : "#1A1A24",
        borderColor: cardDone ? "rgba(16,185,129,0.16)" : "rgba(255,255,255,0.08)",
        opacity: busy ? 0.6 : 1,
        transition: "opacity 200ms ease",
      }}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => !busy && onClick?.()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !busy) onClick?.();
        }}
        className="flex items-center gap-3 cursor-pointer outline-none"
      >
        <HabitIcon emoji={habit.emoji} color={habit.color} size={44} />

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "rgba(255,255,255,0.95)",
                letterSpacing: "-0.015em",
              }}
            >
              {habit.name}
            </span>
            {showStreak && <FireChip n={streak} />}
          </div>

          {isQuantity ? (
            <div style={{ marginTop: 5 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 6,
                  fontSize: 12,
                  color: "#A1A1AA",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                <span style={{ color: "rgba(255,255,255,0.95)", fontWeight: 600 }}>
                  {fmt(currentValue)}/{fmt(target)}
                </span>
                {habit.unit && <span style={{ opacity: 0.8 }}>{habit.unit}</span>}
              </div>
              <div style={{ marginTop: 6 }}>
                <Bar
                  pct={(currentValue / Math.max(1, target)) * 100}
                  gradient="linear-gradient(90deg, #60A5FA, #3B82F6)"
                  height={4}
                />
              </div>
            </div>
          ) : (
            <div
              style={{
                fontSize: 12,
                color: cardDone ? "#34D399" : "#A1A1AA",
                marginTop: 4,
                fontWeight: cardDone ? 600 : 400,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {cardDone ? "Сделано сегодня" : streak > 0 ? `🔥 ${streak} дней подряд` : "Ещё не отмечено"}
            </div>
          )}
        </div>

        {isQuantity ? (
          qFull ? (
            <CheckCircle done={true} />
          ) : (
            <PlusButton onClick={onIncrement} disabled={busy} />
          )
        ) : (
          <CheckCircle done={cardDone} onClick={onToggle} disabled={busy} />
        )}
      </div>
    </CardSurface>
  );
}
