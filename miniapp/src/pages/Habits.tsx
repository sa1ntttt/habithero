import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { schedulePreview } from "../utils/schedule";
import { CardSurface } from "../components/ui/CardSurface";
import { HabitIcon } from "../components/ui/HabitIcon";
import type { HabitOut } from "../types/api";

type Filter = "all" | "today" | "archive";

export function Habits() {
  const habits = useAppStore((s) => s.habits);
  const today = useAppStore((s) => s.today);
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>("all");

  const todayIds = useMemo(
    () => new Set(today.map((it) => it.habit.id)),
    [today],
  );

  const active = useMemo(() => habits.filter((h) => !h.is_archived), [habits]);
  const archived = useMemo(() => habits.filter((h) => h.is_archived), [habits]);
  const todayList = useMemo(
    () => active.filter((h) => todayIds.has(h.id)),
    [active, todayIds],
  );

  const visible =
    filter === "today" ? todayList : filter === "archive" ? archived : active;

  return (
    <div className="flex flex-col gap-4 text-white">
      {/* ─── Header ───────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h1
          style={{
            margin: 0,
            fontSize: 26,
            fontWeight: 600,
            letterSpacing: "-0.4px",
            lineHeight: "32px",
            color: "rgba(255,255,255,0.95)",
          }}
        >
          Привычки
        </h1>
        <CreateButton onClick={() => navigate("/habits/new")} />
      </div>

      {/* ─── Filter chips ─────────────────────────────────── */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1">
        <FilterChip
          label="Все"
          count={active.length}
          active={filter === "all"}
          onClick={() => setFilter("all")}
        />
        <FilterChip
          label="Сегодня"
          count={todayList.length}
          active={filter === "today"}
          onClick={() => setFilter("today")}
        />
        <FilterChip
          label="Архив"
          count={archived.length}
          active={filter === "archive"}
          onClick={() => setFilter("archive")}
        />
      </div>

      {/* ─── List ─────────────────────────────────────────── */}
      {visible.length === 0 ? (
        <CardSurface style={{ padding: 24, textAlign: "center" }}>
          <div style={{ fontSize: 40 }}>🌱</div>
          <p style={{ fontSize: 14, color: "#A1A1AA", marginTop: 8 }}>
            {filter === "archive"
              ? "В архиве пока пусто"
              : filter === "today"
                ? "На сегодня ничего не запланировано"
                : "Список пуст. Создай первую привычку!"}
          </p>
          {filter !== "archive" && (
            <button
              onClick={() => navigate("/habits/new")}
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium text-white"
              style={{
                background: "linear-gradient(135deg, #8B5CF6, #6366F1)",
                boxShadow: "0 4px 12px -2px rgba(139,92,246,0.4)",
              }}
            >
              ➕ Новая привычка
            </button>
          )}
        </CardSurface>
      ) : (
        <div className="flex flex-col gap-2">
          {visible.map((h) => (
            <HabitListCard
              key={h.id}
              habit={h}
              onClick={() => navigate(`/habits/${h.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Create pill button (purple gradient + soft glow) ──────────────
function CreateButton({ onClick }: { onClick: () => void }) {
  const [pressed, setPressed] = useState(false);
  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute -inset-1 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(139,92,246,0.45), transparent 70%)",
          filter: "blur(8px)",
        }}
      />
      <button
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
        onClick={onClick}
        className="relative inline-flex items-center gap-1 rounded-full border-0 px-3.5 py-2 text-white"
        style={{
          background: "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: "-0.1px",
          cursor: "pointer",
          lineHeight: 1,
          boxShadow:
            "0 1px 0 rgba(255,255,255,0.18) inset, 0 -1px 0 rgba(0,0,0,0.2) inset",
          transform: pressed ? "scale(0.96)" : "scale(1)",
          transition: "transform 120ms ease",
        }}
      >
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none">
          <path
            d="M12 5v14M5 12h14"
            stroke="white"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
        Создать
      </button>
    </div>
  );
}

// ─── Filter chip ───────────────────────────────────────────────────
function FilterChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2"
      style={{
        background: active ? "#252535" : "transparent",
        border: active ? "1px solid transparent" : "1px solid rgba(255,255,255,0.06)",
        color: active ? "#ffffff" : "#A1A1AA",
        fontSize: 13,
        fontWeight: 500,
        letterSpacing: "-0.1px",
        cursor: "pointer",
        lineHeight: 1,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {label}
      <span style={{ color: active ? "#A1A1AA" : "#71717A", fontWeight: 500 }}>
        {count}
      </span>
    </button>
  );
}

// ─── Habit list card (different from the today HabitCard — has chevron) ──
function HabitListCard({
  habit,
  onClick,
}: {
  habit: HabitOut;
  onClick: () => void;
}) {
  const [pressed, setPressed] = useState(false);
  const streak = habit.streak?.current_streak ?? 0;
  const meta = schedulePreview(habit.schedule);

  return (
    <div
      role="button"
      tabIndex={0}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
      style={{
        background: "#1A1A24",
        borderRadius: 18,
        border: "1px solid rgba(255,255,255,0.08)",
        padding: 14,
        display: "flex",
        gap: 12,
        alignItems: "center",
        transform: pressed ? "scale(0.98)" : "scale(1)",
        transition: "transform 120ms ease",
        cursor: "pointer",
        userSelect: "none",
        outline: "none",
      }}
    >
      <HabitIcon emoji={habit.emoji} color={habit.color} size={44} />

      <div className="min-w-0 flex-1">
        <div
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: "rgba(255,255,255,0.95)",
            letterSpacing: "-0.2px",
            lineHeight: "20px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {habit.name}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "#A1A1AA",
            marginTop: 2,
            lineHeight: "16px",
            letterSpacing: "-0.1px",
          }}
        >
          {meta}
        </div>
      </div>

      <div
        className="flex shrink-0 flex-col items-end justify-center gap-2 self-stretch"
      >
        {streak > 0 && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 3,
              padding: "3px 8px 3px 6px",
              borderRadius: 999,
              background: "rgba(251,146,60,0.14)",
              color: "#FB923C",
              fontSize: 12,
              fontWeight: 600,
              fontVariantNumeric: "tabular-nums",
              lineHeight: 1,
            }}
          >
            <svg width={11} height={12} viewBox="0 0 24 24" fill="none">
              <path
                d="M12 3.5c.8 2.4 3.5 3.8 3.5 7.5a3.5 3.5 0 0 1-7 0c0-1.2.5-2 1.2-2.5 0 1.3.5 1.8 1 1.8-.2-1.8-.8-3 1.3-6.8Z"
                stroke="#FB923C"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
            {streak}
          </div>
        )}
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
          <path
            d="M9 6l6 6-6 6"
            stroke="#71717A"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
