import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { HabitCard } from "../components/HabitCard";
import { ValueModal } from "../components/ValueModal";
import { CardSurface } from "../components/ui/CardSurface";
import { Bar } from "../components/ui/Bar";
import { api } from "../api/client";
import { useTelegram } from "../hooks/useTelegram";
import { levelTitle } from "../utils/levels";
import type { AchievementOut } from "../types/api";

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
  const [achievements, setAchievements] = useState<AchievementOut[]>([]);
  const [flash, setFlash] = useState<{ habitId: number; xp: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [todayData, achList] = await Promise.all([
          api.getToday(),
          api.listAchievements().catch(() => [] as AchievementOut[]),
        ]);
        if (cancelled) return;
        setToday(todayData.date, todayData.items);
        setAchievements(achList);
      } catch {
        // App.tsx top-level banner covers init errors
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setToday]);

  // Derived state
  const done = today.filter(
    (it) =>
      it.log?.status === "done" ||
      (it.habit.type === "quantity" &&
        it.habit.target_value != null &&
        (it.log?.value ?? 0) >= it.habit.target_value),
  ).length;
  const total = today.length;
  const longestStreak = today.reduce(
    (m, it) => Math.max(m, it.habit.streak?.current_streak ?? 0),
    0,
  );
  const unlockedAch = achievements.filter((a) => a.unlocked).length;
  const totalAch = achievements.length;

  const flashXp = (habitId: number, xp: number) => {
    if (xp <= 0) return;
    setFlash({ habitId, xp });
    window.setTimeout(() => setFlash(null), 1100);
  };

  const handleBinaryCheckin = async (habitId: number) => {
    setBusy(habitId);
    tg?.HapticFeedback?.impactOccurred?.("medium");
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
        tg?.HapticFeedback?.notificationOccurred?.("success");
      }
      flashXp(habitId, res.xp_earned);
    } catch {
      tg?.HapticFeedback?.notificationOccurred?.("error");
    } finally {
      setBusy(null);
    }
  };

  const handleQuantityIncrement = async (habitId: number, value: number) => {
    tg?.HapticFeedback?.impactOccurred?.("light");
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
        tg?.HapticFeedback?.notificationOccurred?.("success");
      }
      flashXp(habitId, res.xp_earned);
    } catch {
      tg?.HapticFeedback?.notificationOccurred?.("error");
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
      tg?.HapticFeedback?.notificationOccurred?.("error");
    }
  };

  const handleCardClick = (habitId: number) => {
    const item = today.find((it) => it.habit.id === habitId);
    if (!item) return;
    if (item.habit.type === "quantity" && item.habit.target_value != null) {
      setModalHabitId(habitId);
    } else {
      handleBinaryCheckin(habitId);
    }
  };

  const modalItem =
    modalHabitId != null ? today.find((it) => it.habit.id === modalHabitId) : null;

  // Level math (works even without server-side level fields)
  const level = user?.level ?? 1;
  const xpInLevel = user?.xp_in_current_level ?? 0;
  const xpForLevel = user?.xp_for_current_level ?? 100;
  const xpToNext = user?.xp_to_next_level ?? xpForLevel - xpInLevel;
  const xpPct = xpForLevel > 0 ? Math.round((xpInLevel / xpForLevel) * 100) : 0;
  const todayPct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-3.5 text-white">
      {/* ─── Hero level card ─────────────────────────────── */}
      <div className="relative">
        <div
          className="pointer-events-none absolute inset-x-3.5 -inset-y-2.5 rounded-3xl"
          style={{
            background:
              "radial-gradient(60% 80% at 50% 50%, rgba(139,92,246,0.32), rgba(139,92,246,0) 70%)",
            filter: "blur(22px)",
          }}
        />
        <div
          className="relative overflow-hidden rounded-[20px]"
          style={{
            padding: "18px 18px 16px",
            background: "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
            boxShadow:
              "0 1px 0 rgba(255,255,255,0.14) inset, 0 -1px 0 rgba(0,0,0,0.2) inset, 0 18px 36px -16px rgba(99,102,241,0.40)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <div className="relative flex items-center gap-4">
            {/* Level medallion */}
            <div
              className="flex shrink-0 items-center justify-center"
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.55), rgba(255,255,255,0.05) 60%), linear-gradient(160deg, #C4B5FD, #6366F1)",
                boxShadow:
                  "0 1px 0 rgba(255,255,255,0.4) inset, 0 -2px 4px rgba(0,0,0,0.2) inset, 0 6px 14px rgba(99,102,241,0.4)",
                border: "1px solid rgba(255,255,255,0.35)",
              }}
            >
              <span
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: "white",
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: "-0.04em",
                  textShadow: "0 1px 2px rgba(0,0,0,0.2)",
                }}
              >
                {level}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.7)",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                Уровень {level}
              </div>
              <div
                style={{
                  fontSize: 19,
                  fontWeight: 700,
                  color: "white",
                  letterSpacing: "-0.02em",
                  marginTop: 2,
                }}
              >
                {levelTitle(level)}
              </div>
              <div
                style={{
                  fontSize: 12.5,
                  color: "rgba(255,255,255,0.78)",
                  fontVariantNumeric: "tabular-nums",
                  marginTop: 4,
                }}
              >
                <span style={{ fontWeight: 600, color: "white" }}>
                  {xpInLevel.toLocaleString("ru-RU")} XP
                </span>
                <span style={{ opacity: 0.65 }}>
                  {" "}
                  / до {xpForLevel.toLocaleString("ru-RU")} XP
                </span>
              </div>
            </div>
          </div>

          <div className="relative mt-3.5 flex items-center gap-2.5">
            <div className="flex-1">
              <Bar
                pct={xpPct}
                gradient="linear-gradient(90deg, #FFFFFF, rgba(255,255,255,0.85))"
                track="rgba(255,255,255,0.22)"
                height={6}
              />
            </div>
            <div
              style={{
                fontSize: 11.5,
                fontWeight: 600,
                color: "white",
                fontVariantNumeric: "tabular-nums",
                letterSpacing: "-0.01em",
              }}
            >
              +{xpToNext} XP
            </div>
          </div>
        </div>
      </div>

      {/* ─── Stats row ───────────────────────────────────── */}
      <div className="flex gap-2">
        <StatCard tone="fire" value={longestStreak} suffix=" дн." label="Серия" />
        <StatCard tone="stats" value={total} suffix=" актив." label="Привычки" />
        <StatCard
          tone="trophy"
          value={totalAch > 0 ? `${unlockedAch}/${totalAch}` : "—"}
          label="Награды"
        />
      </div>

      {/* ─── Today progress ──────────────────────────────── */}
      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <div
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              color: "#71717A",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            Сегодня
          </div>
          <div
            style={{
              fontSize: 12,
              color: "#A1A1AA",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <span style={{ color: "rgba(255,255,255,0.95)", fontWeight: 700 }}>
              {done}
            </span>
            <span style={{ opacity: 0.6 }}> / {total} выполнено</span>
          </div>
        </div>
        <Bar pct={todayPct} height={4} />
      </div>

      {/* ─── Habits today ────────────────────────────────── */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-0.5">
          <div
            style={{
              fontSize: 17,
              fontWeight: 600,
              color: "rgba(255,255,255,0.95)",
              letterSpacing: "-0.02em",
            }}
          >
            Привычки сегодня
          </div>
          {total > 0 && (
            <button
              onClick={() => navigate("/habits")}
              className="inline-flex items-center gap-0.5 bg-transparent border-0 p-0 cursor-pointer"
              style={{ color: "#A78BFA", fontSize: 13, fontWeight: 500 }}
            >
              Все <span style={{ marginLeft: 2 }}>→</span>
            </button>
          )}
        </div>

        {total === 0 ? (
          <CardSurface style={{ padding: 24, textAlign: "center" }}>
            <div style={{ fontSize: 40 }}>🌱</div>
            <p style={{ fontSize: 14, color: "#A1A1AA", marginTop: 8 }}>
              На сегодня нет привычек. Создай первую!
            </p>
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
          </CardSurface>
        ) : (
          <div className="flex flex-col gap-2">
            {today.map((it) => (
              <div key={it.habit.id} className="relative">
                <HabitCard
                  habit={it.habit}
                  log={it.log}
                  busy={busy === it.habit.id}
                  onClick={() => handleCardClick(it.habit.id)}
                  onToggle={() => handleBinaryCheckin(it.habit.id)}
                  onIncrement={() => handleQuantityIncrement(it.habit.id, 1)}
                />
                {flash && flash.habitId === it.habit.id && (
                  <div
                    className="pointer-events-none absolute"
                    style={{
                      right: 56,
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: "#34D399",
                      fontVariantNumeric: "tabular-nums",
                      animation: "xpFloat 1100ms cubic-bezier(.2,.7,.2,1) forwards",
                      textShadow: "0 2px 8px rgba(16,185,129,0.4)",
                    }}
                  >
                    +{flash.xp} XP
                  </div>
                )}
              </div>
            ))}
          </div>
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

// ─── Stat card ─────────────────────────────────────────────
type StatTone = "fire" | "stats" | "trophy" | "success";

function StatCard({
  tone,
  value,
  suffix,
  label,
}: {
  tone: StatTone;
  value: number | string;
  suffix?: string;
  label: string;
}) {
  const colors: Record<StatTone, { bg: string; fg: string }> = {
    fire: { bg: "rgba(251,146,60,0.12)", fg: "#FB923C" },
    stats: { bg: "rgba(34,211,238,0.12)", fg: "#22D3EE" },
    trophy: { bg: "rgba(251,191,36,0.12)", fg: "#FBBF24" },
    success: { bg: "rgba(52,211,153,0.13)", fg: "#34D399" },
  };
  const c = colors[tone];

  return (
    <CardSurface style={{ flex: 1, padding: "12px 10px 12px 12px" }}>
      <div className="flex items-center gap-2">
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 11,
            flexShrink: 0,
            background: c.bg,
            border: "1px solid rgba(255,255,255,0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <StatGlyph tone={tone} color={c.fg} />
        </div>
        <div className="min-w-0">
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "rgba(255,255,255,0.95)",
              fontVariantNumeric: "tabular-nums",
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            {value}
            {suffix && (
              <span
                style={{
                  fontSize: 11,
                  color: "#A1A1AA",
                  fontWeight: 500,
                  marginLeft: 2,
                }}
              >
                {suffix}
              </span>
            )}
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
        </div>
      </div>
    </CardSurface>
  );
}

function StatGlyph({ tone, color }: { tone: StatTone; color: string }) {
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
  if (tone === "stats") {
    return (
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <path
          d="M5 19v-5M12 19v-9M19 19v-13"
          stroke={color}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  // trophy
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
