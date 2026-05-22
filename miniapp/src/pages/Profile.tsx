import { useEffect, useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { useTelegram } from "../hooks/useTelegram";
import { api } from "../api/client";
import { CardSurface } from "../components/ui/CardSurface";
import { Bar } from "../components/ui/Bar";
import { Glyph, glyphFor } from "../components/ui/Glyph";
import type { AchievementOut } from "../types/api";

export function Profile() {
  const user = useAppStore((s) => s.user);
  const { isInsideTelegram, colorScheme } = useTelegram();

  const [achievements, setAchievements] = useState<AchievementOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

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
  const xpProgress =
    xpForLevel > 0 ? Math.min(100, Math.round((xpInLevel / xpForLevel) * 100)) : 0;

  const initial = user?.first_name?.[0]?.toUpperCase() || "?";
  const visibleAchievements = showAll ? achievements : achievements.slice(0, 6);

  return (
    <div className="flex flex-col gap-4 text-white pb-6">
      {/* ─── Title ────────────────────────────────────────── */}
      <h1
        style={{
          margin: 0,
          fontSize: 26,
          fontWeight: 600,
          letterSpacing: "-0.4px",
          color: "rgba(255,255,255,0.95)",
        }}
      >
        Профиль
      </h1>

      {/* ─── Identity hero card ───────────────────────────── */}
      {user && (
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
              padding: 22,
              background: "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
              boxShadow:
                "0 1px 0 rgba(255,255,255,0.14) inset, 0 -1px 0 rgba(0,0,0,0.2) inset, 0 18px 36px -16px rgba(99,102,241,0.40)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex shrink-0 items-center justify-center"
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.45), rgba(255,255,255,0.05) 60%), rgba(255,255,255,0.16)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  boxShadow: "0 1px 0 rgba(255,255,255,0.3) inset",
                }}
              >
                <span
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: "white",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {initial}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: "white",
                    letterSpacing: "-0.02em",
                    lineHeight: 1.1,
                  }}
                >
                  {user.first_name}
                </div>
                {user.username && (
                  <div
                    style={{
                      fontSize: 13,
                      color: "rgba(255,255,255,0.75)",
                      marginTop: 2,
                    }}
                  >
                    @{user.username}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "white",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 3l2.5 6.4L21 10l-5 4.5L17.5 21 12 17.7 6.5 21 8 14.5 3 10l6.5-.6L12 3Z"
                    fill="#FBBF24"
                    stroke="#FBBF24"
                    strokeWidth="1"
                    strokeLinejoin="round"
                  />
                </svg>
                Уровень {user.level}
              </div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "white",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {user.total_xp.toLocaleString("ru-RU")} XP
              </div>
            </div>

            <div className="mt-3">
              <div
                className="flex items-baseline justify-between"
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.78)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                <span>До следующего уровня</span>
                <span>
                  <span style={{ color: "white", fontWeight: 600 }}>
                    {xpInLevel}
                  </span>{" "}
                  / {xpForLevel}
                </span>
              </div>
              <div className="mt-1.5">
                <Bar
                  pct={xpProgress}
                  gradient="linear-gradient(90deg, #FFFFFF, rgba(255,255,255,0.85))"
                  track="rgba(255,255,255,0.22)"
                  height={6}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Achievements card ────────────────────────────── */}
      <CardSurface style={{ padding: 18 }}>
        <div className="mb-3 flex items-center justify-between">
          <div
            className="inline-flex items-center gap-2"
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "rgba(255,255,255,0.95)",
              letterSpacing: "-0.01em",
            }}
          >
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <path
                d="M8 4h8v4.5a4 4 0 0 1-8 0V4Z"
                stroke="#FBBF24"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path
                d="M8 6H5.5a2 2 0 0 0 2.5 3M16 6h2.5a2 2 0 0 1-2.5 3"
                stroke="#FBBF24"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M12 12.5v3.5M9.5 19.5h5M10.5 17h3"
                stroke="#FBBF24"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            Достижения
          </div>
          <div style={{ fontSize: 13, color: "#FBBF24", fontWeight: 600 }}>
            {unlockedCount} / {totalCount}
          </div>
        </div>

        {loading && (
          <p style={{ fontSize: 13, color: "#A1A1AA" }}>Загрузка…</p>
        )}
        {err && (
          <p style={{ fontSize: 13, color: "#F87171" }}>{err}</p>
        )}

        {!loading && achievements.length === 0 && !err && (
          <p style={{ fontSize: 13, color: "#A1A1AA" }}>
            Достижений пока нет
          </p>
        )}

        {achievements.length > 0 && (
          <>
            <div className="grid grid-cols-3 gap-2.5">
              {visibleAchievements.map((ach) => (
                <AchievementTile key={ach.id} achievement={ach} />
              ))}
            </div>
            {totalCount > 6 && (
              <button
                onClick={() => setShowAll((v) => !v)}
                className="mt-3 inline-flex items-center gap-0.5 bg-transparent border-0 p-0 cursor-pointer"
                style={{ color: "#A78BFA", fontSize: 13, fontWeight: 500 }}
              >
                {showAll ? "Свернуть" : `Все ${totalCount}`}{" "}
                <span style={{ marginLeft: 2 }}>→</span>
              </button>
            )}
          </>
        )}
      </CardSurface>

      {/* ─── Settings ─────────────────────────────────────── */}
      {user && (
        <>
          <h2
            style={{
              margin: "8px 0 -4px",
              fontSize: 18,
              fontWeight: 600,
              color: "rgba(255,255,255,0.95)",
              letterSpacing: "-0.01em",
            }}
          >
            Настройки
          </h2>
          <CardSurface style={{ padding: 4 }}>
            <SettingsRow label="Имя" value={user.first_name} />
            <Divider />
            <SettingsRow
              label="Username"
              value={user.username ? `@${user.username}` : "—"}
            />
            <Divider />
            <SettingsRow label="Часовой пояс" value={user.timezone} />
            <Divider />
            <SettingsRow label="Тема" value={colorScheme === "dark" ? "Тёмная" : "Светлая"} />
          </CardSurface>
        </>
      )}

      {/* ─── Info caption ─────────────────────────────────── */}
      <div
        className="rounded-xl px-3 py-2.5"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.05)",
          fontSize: 12,
          color: "#71717A",
          lineHeight: 1.5,
        }}
      >
        Внутри Telegram:{" "}
        <b style={{ color: "#A1A1AA" }}>{isInsideTelegram ? "да" : "нет"}</b>
        <br />
        Версия: <b style={{ color: "#A1A1AA" }}>1.0</b>
      </div>
    </div>
  );
}

function AchievementTile({ achievement }: { achievement: AchievementOut }) {
  const unlocked = achievement.unlocked;
  const glyph = glyphFor(achievement.icon);
  // Unlocked: golden tint always (consistent reward feel). Locked: muted.
  const accent = unlocked ? "#FBBF24" : "#71717A";

  return (
    <div
      title={`${achievement.name}: ${achievement.description}`}
      className="flex flex-col items-center text-center"
      style={{
        padding: "12px 8px",
        borderRadius: 12,
        background: unlocked
          ? "rgba(245,158,11,0.13)"
          : "rgba(255,255,255,0.03)",
        border: unlocked
          ? "1px solid rgba(245,158,11,0.18)"
          : "1px solid rgba(255,255,255,0.05)",
        opacity: unlocked ? 1 : 0.55,
        transition: "all 200ms ease",
      }}
    >
      {glyph ? (
        <Glyph name={glyph.name} size={30} color={accent} strokeWidth={1.9} />
      ) : (
        <span
          style={{
            fontSize: 28,
            lineHeight: 1,
            filter: unlocked ? "none" : "grayscale(1)",
          }}
        >
          {achievement.icon}
        </span>
      )}
      <p
        style={{
          marginTop: 6,
          fontSize: 11.5,
          fontWeight: 600,
          color: unlocked ? "rgba(255,255,255,0.95)" : "#A1A1AA",
          lineHeight: 1.2,
        }}
      >
        {achievement.name}
      </p>
      <p
        style={{
          marginTop: 2,
          fontSize: 10,
          color: unlocked ? "#FBBF24" : "#71717A",
          fontWeight: 600,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        +{achievement.xp_reward} XP
      </p>
    </div>
  );
}

function SettingsRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex items-center justify-between"
      style={{ padding: "12px 14px" }}
    >
      <span style={{ fontSize: 14, color: "#A1A1AA" }}>{label}</span>
      <span
        style={{
          fontSize: 14,
          color: "rgba(255,255,255,0.95)",
          fontWeight: 500,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />;
}
