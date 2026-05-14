import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import { useAppStore } from "../store/useAppStore";
import { useTelegram } from "../hooks/useTelegram";
import { ReminderList } from "../components/ReminderList";
import { ReminderForm } from "../components/ReminderForm";
import type { HabitOut, HabitLogOut, ReminderOut } from "../types/api";
import { schedulePreview } from "../utils/schedule";

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
      tg?.HapticFeedback?.notificationOccurred("success");
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
      tg?.HapticFeedback?.notificationOccurred("success");
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleToggleReminder = async (r: ReminderOut) => {
    try {
      const updated = await api.updateReminder(r.id, { is_active: !r.is_active });
      setReminders((prev) =>
        prev.map((x) => (x.id === r.id ? updated : x))
      );
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

  if (err) return <p className="text-sm text-red-600">{err}</p>;
  if (!habit) return <p className="text-sm text-tg-hint">Загрузка…</p>;

  const dates = lastNDates(7);
  const logMap = new Map(logs.map((l) => [l.log_date, l]));

  return (
    <div className="space-y-4">
      <button onClick={() => navigate(-1)} className="text-sm text-tg-link">
        ← Назад
      </button>

      <header className="rounded-2xl bg-tg-secondary-bg p-5">
        <div className="flex items-center gap-3">
          <span className="text-5xl">{habit.emoji}</span>
          <div>
            <h1 className="text-2xl font-bold">{habit.name}</h1>
            <p className="text-sm text-tg-hint">{schedulePreview(habit.schedule)}</p>
          </div>
        </div>
        {habit.description && (
          <p className="mt-3 text-sm text-tg-hint">{habit.description}</p>
        )}
      </header>

      <div className="grid grid-cols-3 gap-2">
        <Stat icon="🔥" label="Стрик" value={habit.streak?.current_streak ?? 0} />
        <Stat icon="🏆" label="Рекорд" value={habit.streak?.longest_streak ?? 0} />
        <Stat icon="❄️" label="Заморозок" value={`${habit.streak?.freezes_available ?? 2}/2`} />
      </div>

      <section>
        <h2 className="mb-2 text-sm font-medium text-tg-hint">Последние 7 дней</h2>
        <div className="flex gap-1">
          {dates.map((d) => {
            const log = logMap.get(d);
            const done = log?.status === "done";
            const dayNum = new Date(d).getDate();
            return (
              <div
                key={d}
                title={d}
                className={`flex flex-1 flex-col items-center rounded-xl py-2 text-xs ${
                  done ? "bg-emerald-500 text-white" : "bg-tg-secondary-bg text-tg-hint"
                }`}
              >
                <span>{dayNum}</span>
                <span className="text-base">{done ? "✓" : "·"}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-medium text-tg-hint">🔔 Напоминания</h2>
          {!showReminderForm && (
            <button
              onClick={() => setShowReminderForm(true)}
              className="text-xs text-tg-link"
            >
              + Добавить
            </button>
          )}
        </div>

        {showReminderForm && (
          <ReminderForm
            onSubmit={handleAddReminder}
            onCancel={() => setShowReminderForm(false)}
            busy={busy}
          />
        )}

        {!showReminderForm && (
          <ReminderList
            reminders={reminders}
            onToggle={handleToggleReminder}
            onDelete={handleDeleteReminder}
          />
        )}
      </section>

      <button
        onClick={handleArchive}
        disabled={busy}
        className="w-full rounded-xl bg-red-50 py-3 text-sm font-medium text-red-600 disabled:opacity-60"
      >
        🗑 Архивировать
      </button>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: string; label: string; value: number | string }) {
  return (
    <div className="rounded-xl bg-tg-secondary-bg p-3 text-center">
      <div className="text-2xl">{icon}</div>
      <div className="mt-1 text-lg font-bold">{value}</div>
      <div className="text-xs text-tg-hint">{label}</div>
    </div>
  );
}
