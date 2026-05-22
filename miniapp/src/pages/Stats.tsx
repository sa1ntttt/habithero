import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { WeeklyBarChart } from "../components/WeeklyBarChart";
import { ActivityHeatmap, HEATMAP_LEVEL_BG } from "../components/ActivityHeatmap";
import { CardSurface } from "../components/ui/CardSurface";
import type { OverallStats, HabitLogOut } from "../types/api";

const WEEK_DAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const MONTHS_GEN = [
  "янв",
  "фев",
  "мар",
  "апр",
  "мая",
  "июн",
  "июл",
  "авг",
  "сен",
  "окт",
  "ноя",
  "дек",
];

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function lastNDates(n: number): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    out.push(isoDate(d));
  }
  return out;
}

function formatRange(startISO: string, endISO: string) {
  const s = new Date(startISO);
  const e = new Date(endISO);
  const sameMonth = s.getMonth() === e.getMonth();
  if (sameMonth) {
    return `${s.getDate()}–${e.getDate()} ${MONTHS_GEN[s.getMonth()]}`;
  }
  return `${s.getDate()} ${MONTHS_GEN[s.getMonth()]} – ${e.getDate()} ${MONTHS_GEN[e.getMonth()]}`;
}

export function Stats() {
  const [overall, setOverall] = useState<OverallStats | null>(null);
  const [logs, setLogs] = useState<HabitLogOut[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const dates90 = lastNDates(90);
        const [s, l] = await Promise.all([
          api.getStats(),
          api.getLogsRange(dates90[0], dates90[dates90.length - 1]),
        ]);
        if (!cancelled) {
          setOverall(s);
          setLogs(l);
        }
      } catch (e) {
        if (!cancelled) setErr((e as Error).message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const counts = useMemo(() => {
    const out: Record<string, number> = {};
    for (const log of logs) {
      if (log.status !== "done") continue;
      out[log.log_date] = (out[log.log_date] ?? 0) + 1;
    }
    return out;
  }, [logs]);

  const weekDates = useMemo(() => lastNDates(7), []);
  const week = useMemo(() => {
    return weekDates.map((d) => {
      const dateObj = new Date(d);
      const dayIdx = (dateObj.getDay() + 6) % 7;
      return { day: WEEK_DAY_LABELS[dayIdx], count: counts[d] ?? 0 };
    });
  }, [weekDates, counts]);

  const weekTotal = week.reduce((s, d) => s + d.count, 0);
  const weekAvg = weekTotal > 0 ? (weekTotal / 7).toFixed(1) : "0";
  const ninetyTotal = Object.values(counts).reduce((s, n) => s + n, 0);

  if (err) {
    return (
      <p className="text-sm" style={{ color: "#F87171" }}>
        {err}
      </p>
    );
  }

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
            color: "rgba(255,255,255,0.95)",
          }}
        >
          Статистика
        </h1>
        <PeriodPill label="90 дней" />
      </div>

      {/* ─── 2×2 stat grid ────────────────────────────────── */}
      {overall && (
        <div className="grid grid-cols-2 gap-2">
          <BigStatCard
            tone="brand"
            value={overall.active_habits}
            label="Активных привычек"
            glyph={
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="#A78BFA"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            }
          />
          <BigStatCard
            tone="success"
            value={overall.total_checkins}
            label="Всего отметок"
            glyph={
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12.5l4.5 4.5L19 7.5"
                  stroke="#34D399"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
          />
          <BigStatCard
            tone="fire"
            value={overall.longest_streak}
            label="Лучший стрик (дней)"
            glyph={
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 3.5c.8 2.4 3.5 3.8 3.5 7.5a3.5 3.5 0 0 1-7 0c0-1.2.5-2 1.2-2.5 0 1.3.5 1.8 1 1.8-.2-1.8-.8-3 1.3-6.8Z"
                  stroke="#FB923C"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
            }
          />
          <BigStatCard
            tone="cyan"
            value={overall.current_active_streaks}
            label="Активных стриков"
            glyph={
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 3.5c2.6 3.4 6 7 6 10.5a6 6 0 0 1-12 0c0-3.5 3.4-7.1 6-10.5Z"
                  stroke="#22D3EE"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
            }
          />
        </div>
      )}

      {/* ─── Weekly bar chart ─────────────────────────────── */}
      <CardSurface style={{ padding: 16 }}>
        <div className="mb-2 flex items-baseline justify-between">
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "rgba(255,255,255,0.95)",
              letterSpacing: "-0.01em",
            }}
          >
            Активность за неделю
          </div>
          <div style={{ fontSize: 11, color: "#71717A" }}>
            {formatRange(weekDates[0], weekDates[6])}
          </div>
        </div>
        <WeeklyBarChart data={week} />
        <div
          style={{
            marginTop: 8,
            fontSize: 12,
            color: "#A1A1AA",
          }}
        >
          Среднее: <span style={{ color: "rgba(255,255,255,0.95)", fontWeight: 600 }}>{weekAvg}</span> в день
        </div>
      </CardSurface>

      {/* ─── 90-day heatmap ───────────────────────────────── */}
      <CardSurface style={{ padding: 16 }}>
        <div className="mb-3 flex items-baseline justify-between">
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "rgba(255,255,255,0.95)",
              letterSpacing: "-0.01em",
            }}
          >
            Активность за 90 дней
          </div>
          <div style={{ fontSize: 11, color: "#71717A" }}>
            {ninetyTotal} отметок
          </div>
        </div>
        <ActivityHeatmap counts={counts} weeks={13} />
        <div
          className="mt-3 flex items-center gap-1.5"
          style={{ fontSize: 11, color: "#71717A" }}
        >
          <span>меньше</span>
          {HEATMAP_LEVEL_BG.map((bg, i) => (
            <div
              key={i}
              className="h-2.5 w-2.5 rounded-[3px]"
              style={{
                background: bg,
                border: i === 0 ? "1px solid rgba(255,255,255,0.04)" : "none",
              }}
            />
          ))}
          <span>больше</span>
        </div>
      </CardSurface>
    </div>
  );
}

// ─── Period pill (static for now, dropdown later) ──────────────
function PeriodPill({ label }: { label: string }) {
  return (
    <div
      className="inline-flex items-center gap-1 rounded-full px-3 py-1.5"
      style={{
        background: "#1A1A24",
        border: "1px solid rgba(255,255,255,0.08)",
        color: "rgba(255,255,255,0.95)",
        fontSize: 12,
        fontWeight: 500,
      }}
    >
      {label}
      <svg width={12} height={12} viewBox="0 0 24 24" fill="none">
        <path
          d="M6 9l6 6 6-6"
          stroke="#A1A1AA"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

// ─── Big stat card (2×2 grid) ─────────────────────────────────
type StatTone = "brand" | "success" | "fire" | "cyan";

function BigStatCard({
  tone,
  value,
  label,
  glyph,
}: {
  tone: StatTone;
  value: number;
  label: string;
  glyph: React.ReactNode;
}) {
  const tints: Record<StatTone, string> = {
    brand: "rgba(167,139,250,0.14)",
    success: "rgba(52,211,153,0.14)",
    fire: "rgba(251,146,60,0.14)",
    cyan: "rgba(34,211,238,0.14)",
  };

  return (
    <CardSurface style={{ padding: 16 }}>
      <div
        className="mb-2 flex items-center justify-center"
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: tints[tone],
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        {glyph}
      </div>
      <div
        style={{
          fontSize: 28,
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
          marginTop: 6,
          fontWeight: 500,
        }}
      >
        {label}
      </div>
    </CardSurface>
  );
}
