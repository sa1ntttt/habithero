import { useEffect, useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { useTelegram } from "../hooks/useTelegram";
import { api } from "../api/client";
import type { AchievementOut } from "../types/api";

export function Profile() {
  const user = useAppStore((s) => s.user);
  const { isInsideTelegram, colorScheme } = useTelegram();

  const [achievements, setAchievements] = useState<AchievementOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await api.listAchievements();
        if (!cancelled) setAchievements(list);
      } catch (e) {
        if (!cancelled) setErr((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;

  const xpInLevel = user?.xp_in_current_level ?? 0;
  const xpForLevel = user?.xp_for_current_level ?? 100;
  const xpProgress = xpForLevel > 0 ? Math.min(100, Math.round((xpInLevel / xpForLevel) * 100)) : 0;

  return (
    <div className="space-y-4 pb-8">
      <h1 className="text-2xl font-bold">Профиль</h1>

      {user && (
        <header className="rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 p-5 text-white shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-2xl font-bold">
              {user.first_name?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{user.first_name}</h2>
              {user.username && <p className="text-sm opacity-80">@{user.username}</p>}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-lg font-semibold">⭐ Уровень {user.level}</span>
            <span className="text-sm opacity-90">{user.total_xp} XP</span>
          </div>

          <div className="mt-2">
            <div className="flex items-center justify-between text-xs opacity-90">
              <span>До следующего уровня</span>
              <span>
                {xpInLevel} / {xpForLevel}
              </span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full bg-white transition-all"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
          </div>
        </header>
      )}

      <section className="rounded-2xl bg-tg-secondary-bg p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">🏆 Достижения</h2>
          <span className="text-sm text-tg-hint">
            {unlockedCount} / {totalCount}
          </span>
        </div>

        {loading && <p className="text-sm text-tg-hint">Загрузка…</p>}
        {err && <p className="text-sm text-red-600">{err}</p>}

        {!loading && achievements.length === 0 && (
          <p className="text-sm text-tg-hint">Достижений пока нет</p>
        )}

        <div className="grid grid-cols-3 gap-2">
          {achievements.map((ach) => (
            <AchievementTile key={ach.id} achievement={ach} />
          ))}
        </div>
      </section>

      {user && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Настройки</h2>
          <Row label="Имя" value={user.first_name} />
          {user.username && <Row label="Username" value={`@${user.username}`} />}
          <Row label="Часовой пояс" value={user.timezone} />
        </section>
      )}

      <div className="rounded-xl bg-tg-secondary-bg p-3 text-xs text-tg-hint">
        <p>Внутри Telegram: <b>{isInsideTelegram ? "да" : "нет"}</b></p>
        <p>Тема: <b>{colorScheme}</b></p>
      </div>
    </div>
  );
}

function AchievementTile({ achievement }: { achievement: AchievementOut }) {
  const unlocked = achievement.unlocked;
  return (
    <div
      title={`${achievement.name}: ${achievement.description}`}
      className={`flex flex-col items-center rounded-xl p-3 text-center transition ${
        unlocked ? "bg-amber-100 dark:bg-amber-900/30" : "bg-tg-bg opacity-40 grayscale"
      }`}
    >
      <span className="text-3xl">{achievement.icon}</span>
      <p className="mt-1 text-xs font-semibold leading-tight">{achievement.name}</p>
      <p className="mt-0.5 text-[10px] text-tg-hint leading-tight">
        +{achievement.xp_reward} XP
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-tg-secondary-bg px-4 py-3">
      <span className="text-sm text-tg-hint">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
