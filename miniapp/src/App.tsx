import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import { Dashboard } from "./pages/Dashboard";
import { Habits } from "./pages/Habits";
import { HabitDetail } from "./pages/HabitDetail";
import { NewHabit } from "./pages/NewHabit";
import { Stats } from "./pages/Stats";
import { Profile } from "./pages/Profile";
import { Friends } from "./pages/Friends";
import { Navigation } from "./components/Navigation";
import { useTelegram } from "./hooks/useTelegram";
import { useAppStore } from "./store/useAppStore";
import { api, ApiError } from "./api/client";

export default function App() {
  useTelegram();
  const setUser = useAppStore((s) => s.setUser);
  const setHabits = useAppStore((s) => s.setHabits);
  const setLoading = useAppStore((s) => s.setLoading);
  const setError = useAppStore((s) => s.setError);
  const loading = useAppStore((s) => s.loading);
  const error = useAppStore((s) => s.error);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [user, habits] = await Promise.all([api.getMe(), api.listHabits()]);
        if (cancelled) return;
        setUser(user);
        setHabits(habits);
      } catch (e) {
        if (cancelled) return;
        const msg =
          e instanceof ApiError
            ? `${e.status}: ${e.message}`
            : (e as Error).message || "Не удалось загрузить данные";
        setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setUser, setHabits, setLoading, setError]);

  return (
    <div className="min-h-full pb-20">
      <main className="mx-auto max-w-md p-4">
        {loading && <p className="text-sm text-tg-hint">Загрузка…</p>}
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            <p className="font-medium">Ошибка авторизации</p>
            <p className="opacity-80">{error}</p>
            <p className="mt-2 text-xs opacity-70">
              Открой Mini App через бота в Telegram — initData приходит только оттуда.
            </p>
          </div>
        )}

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/habits/new" element={<NewHabit />} />
          <Route path="/habits/:id" element={<HabitDetail />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
      <Navigation />
    </div>
  );
}
