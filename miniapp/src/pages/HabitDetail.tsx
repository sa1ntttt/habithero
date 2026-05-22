import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import { useAppStore } from "../store/useAppStore";
import { useTelegram } from "../hooks/useTelegram";
import { ReminderList } from "../components/ReminderList";
import { ReminderForm } from "../components/ReminderForm";
import { CardSurface } from "../components/ui/CardSurface";
import { HabitIcon } from "../components/ui/HabitIcon";
import type { HabitOut, HabitLogOut, ReminderOut } from "../types/api";
import { schedulePreview } from "../utils/schedule";

const WEEKDAY_SHORT = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function lastNDates(n: number): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

export function HabitDetail() {
  const { id } = useParams<{ id: string }>();
  const habitId = Number(id);
  const navigate = useNavigate();
  const { tg } = useTelegram();
  const removeHabit = useAppStore((s) => s.removeHabit);

  const [habit, setHabit] = useState<HabitOut | null>(null);
  const [logs, setLogs] = useState<HabitLogOut[]>([]);
  const [reminders, setReminders] = useState<ReminderOut[]>([]);
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!habitId) return;
    let cancelled = false;
    (async () => {
      try {
        const dates = lastNDates(7);
        const [h, ls, rs] = await Promise.all([
          api.getHabit(habitId),
          api.getLogs(habitId, dates[0], dates[dates.length - 1]),
          api.listReminders(habitId),
        ]);
        if (!cancelled) {
          setHabit(h);
          setLogs(ls);
          setReminders(rs);
        }
      } catch (e) {
        if (!cancelled) setErr((e as Error).message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [habitId]);

  const handleArchive = async () => {
    if (!habit) return;
    if (!confirm(`Архивировать «${habit.name}»? Привычка скроется из активных.`)) return;
    setBusy(true);
    try {
      await api.archiveHabit(habit.id);
      removeHabit(habit.id);
      tg?.HapticFeedback?.notificationOccurred?.("success");
      navigate("/habits");
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleAddReminder = async (time: string, days: number[]) => {
    setBusy(true);
    try {
      const r = await api.createReminder(habitId, {
        time,
        days_of_week: days,
        is_active: true,
      });
      setReminders((prev) => [...prev, r]);
      setShowReminderForm(false);
      tg?.HapticFeedback?.notificationOccurred?.("success");
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleToggleReminder = async (r: ReminderOut) => {
    try {
      const updated = await api.updateReminder(r.id, { is_active: !r.is_active });
      setReminders((prev) => prev.map((x) => (x.id === r.id ? updated : x)));
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  const handleDeleteReminder = async (r: ReminderOut) => {
    if (!confirm("Удалить напоминание?")) return;
    try {
      await api.deleteReminder(r.id);
      setReminders((prev) => prev.filter((x) => x.id !== r.id));
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  if (err) {
    return (
      <div className="text-white">
        <BackButton onClick={() => navigate(-1)} />
        <p className="mt-3" style={{ fontSize: 14, color: "#F87171" }}>
          {err}
        </p>
      </div>
    );
  }
  if (!habit) {
    return (
      <div className="text-white">
        <BackButton onClick={() => navigate(-1)} />
        <p className="mt-3" style={{ fontSize: 13, color: "#A1A1AA" }}>
          Загрузка…
        </p>
      </div>
    );
  }

  const dates = lastNDates(7);
  const logMap = new Map(logs.map((l) => [l.log_date, l]));

  return (
    <div className="flex flex-col gap-4 text-white pb-6">
      {/* ─── Back ─────────────────────────────────────────── */}
      <BackButton onClick={() => navigate(-1)} />

      {/* ─── Hero ─────────────────────────────────────────── */}
      <CardSurface style={{ padding: 18 }}>
        <div className="flex items-center gap-3">
          <HabitIcon emoji={habit.emoji} color={habit.color} size={56} />
          <div className="min-w-0 flex-1">
            <h1
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 700,
                color: "rgba(255,255,255,0.95)",
                letterSpacing: "-0.02em",
                lineHeight: 1.15,
              }}
            >
              {habit.name}
            </h1>
            <p
              style={{
                marginTop: 2,
                fontSize: 13,
                color: "#A1A1AA",
              }}
            >
              {schedulePreview(habit.schedule)}
              {habit.type === "quantity" && habit.target_value != null && (
                <>
                  {" · "}
                  {habit.target_value}
                  {habit.unit ? ` ${habit.unit}` : ""}
                </>
              )}
            </p>
          </div>
        </div>
        {habit.description && (
          <p
            style={{
              marginTop: 12,
              fontSize: 13,
              color: "#A1A1AA",
              lineHeight: 1.5,
            }}
          >
            {habit.description}
          </p>
        )}
      </CardSurface>

      {/* ─── Stats ────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2">
        <DetailStat
          tone="fire"
          value={habit.streak?.current_streak ?? 0}
          label="Стрик"
        />
        <DetailStat
          tone="trophy"
          value={habit.streak?.longest_streak ?? 0}
          label="Рекорд"
        />
        <DetailStat
          tone="cyan"
          value={`${habit.streak?.freezes_available ?? 2}/2`}
          label="Заморозок"
        />
      </div>

      {/* ─── Last 7 days ──────────────────────────────────── */}
      <section className="flex flex-col gap-2">
        <h2
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: "rgba(255,255,255,0.95)",
            letterSpacing: "-0.01em",
          }}
        >
          Последние 7 дней
        </h2>
        <div className="flex gap-1.5">
          {dates.map((d) => {
            const log = logMap.get(d);
            const done = log?.status === "done";
            const dt = new Date(d);
            const dayNum = dt.getDate();
            const wd = (dt.getDay() + 6) % 7;
            return (
              <div
                key={d}
                title={d}
                className="flex flex-1 flex-col items-center gap-1"
                style={{
                  padding: "10px 4px 8px",
                  borderRadius: 12,
                  background: done
                    ? "linear-gradient(180deg, rgba(16,185,129,0.18), rgba(5,150,105,0.06))"
                    : "#1A1A24",
                  border: done
                    ? "1px solid rgba(16,185,129,0.32)"
                    : "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    color: "#71717A",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                >
                  {WEEKDAY_SHORT[wd]}
                </span>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: done ? "#34D399" : "rgba(255,255,255,0.95)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {dayNum}
                </span>
                {done ? (
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12.5l4.5 4.5L19 7.5"
                      stroke="#34D399"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <span
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      background: "#3F3F46",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Reminders ────────────────────────────────────── */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2
            className="inline-flex items-center gap-2"
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "rgba(255,255,255,0.95)",
              letterSpacing: "-0.01em",
            }}
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <path
                d="M6 9a6 6 0 1 1 12 0c0 4.5 2 5.5 2 7H4c0-1.5 2-2.5 2-7Zm4 11a2 2 0 0 0 4 0"
                stroke="#A78BFA"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Напоминания
          </h2>
          {!showReminderForm && (
            <button
              onClick={() => setShowReminderForm(true)}
              className="inline-flex items-center gap-0.5 bg-transparent border-0 p-0 cursor-pointer"
              style={{ color: "#A78BFA", fontSize: 13, fontWeight: 500 }}
            >
              + Добавить
            </button>
          )}
        </div>

        {showReminderForm ? (
          <ReminderForm
            onSubmit={handleAddReminder}
            onCancel={() => setShowReminderForm(false)}
            busy={busy}
          />
        ) : (
          <ReminderList
            reminders={reminders}
            onToggle={handleToggleReminder}
            onDelete={handleDeleteReminder}
          />
        )}
      </section>

      {/* ─── Archive ──────────────────────────────────────── */}
      <button
        onClick={handleArchive}
        disabled={busy}
        className="w-full py-3 text-sm font-semibold disabled:opacity-60"
        style={{
          borderRadius: 14,
          background: "rgba(239,68,68,0.10)",
          border: "1px solid rgba(239,68,68,0.20)",
          color: "#F87171",
          cursor: busy ? "default" : "pointer",
        }}
      >
        🗑 Архивировать
      </button>
    </div>
  );
}

// ─── Back chevron button ───────────────────────────────────────
function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-0.5 self-start bg-transparent border-0 p-0 cursor-pointer"
      style={{ color: "#A78BFA", fontSize: 15 }}
    >
      <svg width={17} height={17} viewBox="0 0 24 24" fill="none">
        <path
          d="M15 6l-6 6 6 6"
          stroke="#A78BFA"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Назад
    </button>
  );
}

// ─── Detail stat (3-card row) ──────────────────────────────────
type DetailTone = "fire" | "trophy" | "cyan";

function DetailStat({
  tone,
  value,
  label,
}: {
  tone: DetailTone;
  value: number | string;
  label: string;
}) {
  const tints: Record<DetailTone, { bg: string; fg: string }> = {
    fire: { bg: "rgba(251,146,60,0.14)", fg: "#FB923C" },
    trophy: { bg: "rgba(251,191,36,0.14)", fg: "#FBBF24" },
    cyan: { bg: "rgba(34,211,238,0.14)", fg: "#22D3EE" },
  };
  const c = tints[tone];

  return (
    <CardSurface style={{ padding: 14, textAlign: "center" }}>
      <div
        className="mx-auto mb-1.5 flex items-center justify-center"
        style={{
          width: 36,
          height: 36,
          borderRadius: 11,
          background: c.bg,
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <DetailGlyph tone={tone} color={c.fg} />
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: "rgba(255,255,255,0.95)",
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "-0.03em",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 11,
          color: "#71717A",
          marginTop: 4,
          fontWeight: 500,
        }}
      >
        {label}
      </div>
    </CardSurface>
  );
}

function DetailGlyph({ tone, color }: { tone: DetailTone; color: string }) {
  if (tone === "fire") {
    return (
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <path
          d="M12 3.5c.8 2.4 3.5 3.8 3.5 7.5a3.5 3.5 0 0 1-7 0c0-1.2.5-2 1.2-2.5 0 1.3.5 1.8 1 1.8-.2-1.8-.8-3 1.3-6.8Z"
          stroke={color}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (tone === "trophy") {
    return (
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <path
          d="M8 4h8v4.5a4 4 0 0 1-8 0V4Z"
          stroke={color}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M8 6H5.5a2 2 0 0 0 2.5 3M16 6h2.5a2 2 0 0 1-2.5 3"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M12 12.5v3.5M9.5 19.5h5M10.5 17h3"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  // cyan = snowflake / freeze
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2v20M4.2 6l15.6 12M4.2 18L19.8 6"
        stroke={color}
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M12 6l-2-2M12 6l2-2M12 18l-2 2M12 18l2 2M6 12l-2-2M6 12l-2 2M18 12l2-2M18 12l2 2"
        stroke={color}
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
