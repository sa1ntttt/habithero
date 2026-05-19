import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { HabitCard } from "../components/HabitCard";
import { ValueModal } from "../components/ValueModal";
import { api } from "../api/client";
import { useTelegram } from "../hooks/useTelegram";

export function Dashboard() {
  const user = useAppStore((s) => s.user);
  const today = useAppStore((s) => s.today);
  const setToday = useAppStore((s) => s.setToday);
  const updateTodayItem = useAppStore((s) => s.updateTodayItem);
  const upsertHabit = useAppStore((s) => s.upsertHabit);
  const navigate = useNavigate();
  const { tg } = useTelegram();

  const [busy, setBusy] = useState<number | null>(null);
  const [modalHabitId, setModalHabitId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.getToday();
        if (!cancelled) setToday(data.date, data.items);
      } catch {
        // App.tsx top-level error banner already covers initial errors
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setToday]);

  const done = today.filter((it) => it.log?.status === "done").length;
  const total = today.length;
  const progress = total === 0 ? 0 : Math.round((done / total) * 100);

  const handleBinaryCheckin = async (habitId: number) => {
    setBusy(habitId);
    tg?.HapticFeedback?.impactOccurred("medium");
    try {
      const res = await api.checkin(habitId);
      updateTodayItem(habitId, { log: res.log });
      const current = today.find((it) => it.habit.id === habitId);
      if (current) {
        const updatedHabit = { ...current.habit, streak: res.streak };
        upsertHabit(updatedHabit);
        updateTodayItem(habitId, { habit: updatedHabit });
      }
      if (res.streak_grew) {
        tg?.HapticFeedback?.notificationOccurred("success");
      }
    } catch {
      tg?.HapticFeedback?.notificationOccurred("error");
    } finally {
      setBusy(null);
    }
  };

  const handleQuantityIncrement = async (habitId: number, value: number) => {
    tg?.HapticFeedback?.impactOccurred("light");
    try {
      const res = await api.checkin(habitId, { value });
      updateTodayItem(habitId, { log: res.log });
      const current = today.find((it) => it.habit.id === habitId);
      if (current) {
        const updatedHabit = { ...current.habit, streak: res.streak };
        upsertHabit(updatedHabit);
        updateTodayItem(habitId, { habit: updatedHabit });
      }
      if (res.streak_grew) {
        tg?.HapticFeedback?.notificationOccurred("success");
      }
    } catch {
      tg?.HapticFeedback?.notificationOccurred("error");
    }
  };

  const handleQuantityReset = async (habitId: number) => {
    try {
      await api.resetToday(habitId);
      const current = today.find((it) => it.habit.id === habitId);
      if (current && current.log) {
        updateTodayItem(habitId, {
          log: { ...current.log, value: 0, status: "failed" },
        });
      }
    } catch {
      tg?.HapticFeedback?.notificationOccurred("error");
    }
  };

  const handleCardClick = (habitId: number) => {
    const item = today.find((it) => it.habit.id === habitId);
    if (!item) return;
    if (
      (item.habit.type === "quantity" || item.habit.type === "timer") &&
      item.habit.target_value != null
    ) {
      setModalHabitId(habitId);
    } else {
      handleBinaryCheckin(habitId);
    }
  };

  const modalItem = modalHabitId != null ? today.find((it) => it.habit.id === modalHabitId) : null;

  return (
    <div className="space-y-4">
      <header className="rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 p-5 text-white shadow-md">
        <p className="text-sm opacity-80">Привет,</p>
        <h1 className="text-2xl font-bold">{user?.first_name || "друг"} 👋</h1>
        <div className="mt-3 flex items-center gap-3 text-sm">
          <span>⭐ Уровень {user?.level ?? 1}</span>
          <span>·</span>
          <span>🎯 {user?.total_xp ?? 0} XP</span>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs opacity-90">
            <span>Сегодня</span>
            <span>{done} / {total}</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full bg-white transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Привычки сегодня</h2>
        {total === 0 ? (
          <div className="rounded-2xl bg-tg-secondary-bg p-6 text-center">
            <p className="text-4xl">🌱</p>
            <p className="mt-2 text-sm text-tg-hint">
              На сегодня нет привычек. Создай первую!
            </p>
            <button
              onClick={() => navigate("/habits/new")}
              className="mt-3 rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white"
            >
              ➕ Новая привычка
            </button>
          </div>
        ) : (
          today.map((it) => (
            <HabitCard
              key={it.habit.id}
              habit={it.habit}
              log={it.log}
              busy={busy === it.habit.id}
              onClick={() => handleCardClick(it.habit.id)}
            />
          ))
        )}
      </section>

      {modalItem && (
        <ValueModal
          habit={modalItem.habit}
          log={modalItem.log}
          onClose={() => setModalHabitId(null)}
          onIncrement={(v) => handleQuantityIncrement(modalItem.habit.id, v)}
          onReset={() => handleQuantityReset(modalItem.habit.id)}
        />
      )}
    </div>
  );
}
