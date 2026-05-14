import { useEffect, useState } from "react";
import { api } from "../api/client";
import { WeeklyBarChart } from "../components/WeeklyBarChart";
import { ActivityHeatmap } from "../components/ActivityHeatmap";
import type { OverallStats, HabitLogOut } from "../types/api";

const WEEK_DAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

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

  // Build per-day counts (only "done")
  const counts: Record<string, number> = {};
  for (const log of logs) {
    if (log.status !== "done") continue;
    counts[log.log_date] = (counts[log.log_date] ?? 0) + 1;
  }

  // Last 7 days for bar chart
  const week = lastNDates(7).map((d) => {
    const dateObj = new Date(d);
    const dayIdx = (dateObj.getDay() + 6) % 7;
    return { day: WEEK_DAY_LABELS[dayIdx], count: counts[d] ?? 0 };
  });

  if (err) return <p className="text-sm text-red-600">{err}</p>;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Статистика</h1>

      {overall && (
        <div className="grid grid-cols-2 gap-2">
          <StatCard icon="📋" label="Привычек" value={overall.active_habits} />
          <StatCard icon="✅" label="Выполнений" value={overall.total_checkins} />
          <StatCard icon="🏆" label="Лучший стрик" value={overall.longest_streak} />
          <StatCard icon="🔥" label="Активных стриков" value={overall.current_active_streaks} />
        </div>
      )}

      <section className="rounded-2xl bg-tg-secondary-bg p-4">
        <h2 className="mb-3 text-sm font-medium text-tg-hint">За неделю</h2>
        <WeeklyBarChart data={week} />
      </section>

      <section className="rounded-2xl bg-tg-secondary-bg p-4">
        <h2 className="mb-3 text-sm font-medium text-tg-hint">Активность за 90 дней</h2>
        <ActivityHeatmap counts={counts} weeks={13} />
        <div className="mt-3 flex items-center gap-2 text-xs text-tg-hint">
          <span>Меньше</span>
          <div className="h-3 w-3 rounded-[3px] bg-tg-bg" />
          <div className="h-3 w-3 rounded-[3px] bg-emerald-200" />
          <div className="h-3 w-3 rounded-[3px] bg-emerald-400" />
          <div className="h-3 w-3 rounded-[3px] bg-emerald-500" />
          <div className="h-3 w-3 rounded-[3px] bg-emerald-600" />
          <span>Больше</span>
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-tg-secondary-bg p-4 text-center">
      <div className="text-3xl">{icon}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
      <div className="text-xs text-tg-hint">{label}</div>
    </div>
  );
}
