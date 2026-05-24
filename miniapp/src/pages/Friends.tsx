import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useTelegram } from "../hooks/useTelegram";
import { CardSurface } from "../components/ui/CardSurface";
import { Glyph, glyphFor } from "../components/ui/Glyph";
import { CreateJointHabitModal } from "../components/CreateJointHabitModal";
import type {
  FriendOut,
  FeedItem,
  InviteLinkOut,
  JointHabitOut,
} from "../types/api";

const AVATAR_COLORS = [
  { bg: "#8B5CF6", glow: "rgba(139,92,246,0.4)" },
  { bg: "#06B6D4", glow: "rgba(6,182,212,0.4)" },
  { bg: "#F97316", glow: "rgba(249,115,22,0.4)" },
  { bg: "#10B981", glow: "rgba(16,185,129,0.4)" },
  { bg: "#EC4899", glow: "rgba(236,72,153,0.4)" },
  { bg: "#FBBF24", glow: "rgba(251,191,36,0.4)" },
];

function avatarColor(id: number) {
  return AVATAR_COLORS[Math.abs(id) % AVATAR_COLORS.length];
}

export function Friends() {
  const { tg } = useTelegram();
  const [friends, setFriends] = useState<FriendOut[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [invite, setInvite] = useState<InviteLinkOut | null>(null);
  const [joints, setJoints] = useState<JointHabitOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [f, l, i, j] = await Promise.all([
          api.listFriends(),
          api.getFeed(50, 30),
          api.getInviteLink(),
          api.listJointHabits(),
        ]);
        if (!cancelled) {
          setFriends(f);
          setFeed(l);
          setInvite(i);
          setJoints(j);
        }
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

  const shareInvite = () => {
    if (!invite) return;
    const tgAny = tg as unknown as { openTelegramLink?: (url: string) => void };
    const shareUrl =
      "https://t.me/share/url?url=" +
      encodeURIComponent(invite.link) +
      "&text=" +
      encodeURIComponent("Присоединяйся ко мне в HabitHero — трекере привычек 💪");
    if (tgAny.openTelegramLink) tgAny.openTelegramLink(shareUrl);
    else window.open(shareUrl, "_blank");
  };

  const copyLink = async () => {
    if (!invite) return;
    try {
      await navigator.clipboard.writeText(invite.link);
      tg?.HapticFeedback?.notificationOccurred?.("success");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      alert(invite.link);
    }
  };

  const handleAccept = async (id: number) => {
    try {
      const updated = await api.acceptJointHabit(id);
      tg?.HapticFeedback?.notificationOccurred?.("success");
      setJoints((prev) => prev.map((j) => (j.id === id ? updated : j)));
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  const handleDecline = async (id: number) => {
    try {
      await api.declineJointHabit(id);
      tg?.HapticFeedback?.impactOccurred?.("light");
      setJoints((prev) => prev.filter((j) => j.id !== id));
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  const handleLeave = async (id: number) => {
    if (!confirm("Прекратить совместную привычку?")) return;
    try {
      await api.leaveJointHabit(id);
      tg?.HapticFeedback?.impactOccurred?.("light");
      setJoints((prev) => prev.filter((j) => j.id !== id));
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  const incoming = joints.filter(
    (j) => j.status === "pending" && j.role === "partner",
  );
  const sentPending = joints.filter(
    (j) => j.status === "pending" && j.role === "creator",
  );
  const active = joints.filter((j) => j.status === "active");

  return (
    <div className="flex flex-col gap-4 text-white pb-6">
      {/* ─── Title ────────────────────────────────────────── */}
      <div className="flex items-baseline justify-between">
        <h1
          style={{
            margin: 0,
            fontSize: 26,
            fontWeight: 600,
            letterSpacing: "-0.4px",
            color: "rgba(255,255,255,0.95)",
          }}
        >
          Друзья
        </h1>
        {!loading && (
          <span style={{ fontSize: 13, color: "#71717A" }}>
            {friends.length}{" "}
            {friends.length === 1
              ? "друг"
              : friends.length < 5 && friends.length > 0
                ? "друга"
                : "друзей"}
          </span>
        )}
      </div>

      {err && <p style={{ fontSize: 13, color: "#F87171" }}>{err}</p>}

      {/* ─── Invite hero ──────────────────────────────────── */}
      <div className="relative">
        <div
          className="pointer-events-none absolute inset-x-3.5 -inset-y-2.5 rounded-3xl"
          style={{
            background:
              "radial-gradient(60% 80% at 50% 50%, rgba(139,92,246,0.28), rgba(139,92,246,0) 70%)",
            filter: "blur(22px)",
          }}
        />
        <div
          className="relative overflow-hidden rounded-[20px]"
          style={{
            padding: 20,
            background: "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
            boxShadow:
              "0 1px 0 rgba(255,255,255,0.14) inset, 0 -1px 0 rgba(0,0,0,0.2) inset, 0 18px 36px -16px rgba(99,102,241,0.40)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <div className="flex items-center gap-2.5">
            <span style={{ fontSize: 22 }}>🤝</span>
            <div
              style={{
                fontSize: 17,
                fontWeight: 700,
                color: "white",
                letterSpacing: "-0.01em",
              }}
            >
              Пригласить друга
            </div>
          </div>
          <p
            style={{
              marginTop: 6,
              fontSize: 13,
              color: "rgba(255,255,255,0.78)",
              lineHeight: 1.4,
            }}
          >
            Поделись ссылкой — кто перейдёт, станет твоим другом.
          </p>
          <div className="mt-3.5 flex gap-2">
            <button
              onClick={shareInvite}
              disabled={!invite}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 font-semibold disabled:opacity-50"
              style={{
                background: "white",
                color: "#6366F1",
                fontSize: 14,
                boxShadow: "0 4px 12px -2px rgba(0,0,0,0.2)",
              }}
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 4v12M6 10l6-6 6 6M5 20h14"
                  stroke="#6366F1"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Поделиться
            </button>
            <button
              onClick={copyLink}
              disabled={!invite}
              className="flex items-center justify-center rounded-xl disabled:opacity-50"
              style={{
                width: 48,
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
              title={copied ? "Скопировано!" : "Скопировать ссылку"}
            >
              {copied ? (
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12.5l4.5 4.5L19 7.5"
                    stroke="white"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <rect
                    x="9"
                    y="9"
                    width="11"
                    height="11"
                    rx="2"
                    stroke="white"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M5 15V6a2 2 0 0 1 2-2h9"
                    stroke="white"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Friends list ─────────────────────────────────── */}
      <section className="flex flex-col gap-2">
        <h2
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: "rgba(255,255,255,0.95)",
            letterSpacing: "-0.01em",
          }}
        >
          Твои друзья {friends.length > 0 && `(${friends.length})`}
        </h2>
        {friends.length === 0 ? (
          <CardSurface style={{ padding: 16 }}>
            <p style={{ fontSize: 13, color: "#A1A1AA" }}>
              Пока никого нет. Поделись ссылкой выше — и друзья появятся 👆
            </p>
          </CardSurface>
        ) : (
          <div className="flex flex-col gap-2">
            {friends.map((f) => (
              <FriendRow key={f.id} friend={f} />
            ))}
          </div>
        )}
      </section>

      {/* ─── Pending incoming invitations ─────────────────── */}
      {incoming.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "rgba(255,255,255,0.95)",
              letterSpacing: "-0.01em",
            }}
          >
            Приглашения
          </h2>
          {incoming.map((j) => (
            <IncomingInvitationCard
              key={j.id}
              joint={j}
              onAccept={() => handleAccept(j.id)}
              onDecline={() => handleDecline(j.id)}
            />
          ))}
        </section>
      )}

      {/* ─── Joint habits ─────────────────────────────────── */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "rgba(255,255,255,0.95)",
              letterSpacing: "-0.01em",
            }}
          >
            Совместные привычки
          </h2>
          {friends.length > 0 && (
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-0.5 bg-transparent border-0 p-0 cursor-pointer"
              style={{ color: "#A78BFA", fontSize: 13, fontWeight: 500 }}
            >
              Создать +
            </button>
          )}
        </div>

        {active.length === 0 && sentPending.length === 0 ? (
          <JointHabitsEmptyState
            hasFriends={friends.length > 0}
            onCreate={() => setShowCreate(true)}
          />
        ) : (
          <div className="flex flex-col gap-2">
            {active.map((j) => (
              <ActiveJointCard
                key={j.id}
                joint={j}
                onLeave={() => handleLeave(j.id)}
              />
            ))}
            {sentPending.map((j) => (
              <SentInvitationCard
                key={j.id}
                joint={j}
                onCancel={() => handleLeave(j.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ─── Activity feed ────────────────────────────────── */}
      <section className="flex flex-col gap-2">
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
            <rect
              x="4"
              y="3"
              width="16"
              height="18"
              rx="2"
              stroke="#A78BFA"
              strokeWidth="1.7"
            />
            <path
              d="M8 8h8M8 12h8M8 16h5"
              stroke="#A78BFA"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          </svg>
          Лента активности
        </h2>
        {loading ? (
          <CardSurface style={{ padding: 16 }}>
            <p style={{ fontSize: 13, color: "#A1A1AA" }}>Загрузка…</p>
          </CardSurface>
        ) : feed.length === 0 ? (
          <CardSurface style={{ padding: 16 }}>
            <p style={{ fontSize: 13, color: "#A1A1AA" }}>
              Тут будут события — твои и друзей. Сделай отметку или открой ачивку!
            </p>
          </CardSurface>
        ) : (
          <div className="flex flex-col gap-2">
            {feed.map((item) => (
              <FeedEntry key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      {showCreate && (
        <CreateJointHabitModal
          friends={friends}
          onClose={() => setShowCreate(false)}
          onCreated={(j) => {
            setJoints((prev) => [j, ...prev]);
            setShowCreate(false);
          }}
        />
      )}
    </div>
  );
}

// ─── Friend row ─────────────────────────────────────────────────
function FriendRow({ friend }: { friend: FriendOut }) {
  const c = avatarColor(friend.id);
  const initial = friend.first_name?.[0]?.toUpperCase() || "?";

  return (
    <div
      className="flex items-center gap-3"
      style={{
        padding: 12,
        borderRadius: 16,
        background: "#1A1A24",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div
        className="flex shrink-0 items-center justify-center"
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: c.bg,
          color: "white",
          fontSize: 18,
          fontWeight: 700,
          boxShadow: `0 4px 12px -2px ${c.glow}`,
        }}
      >
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        <div
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: "rgba(255,255,255,0.95)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {friend.first_name}
        </div>
        {friend.username && (
          <div
            style={{
              fontSize: 12,
              color: "#A1A1AA",
              marginTop: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            @{friend.username}
          </div>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-end">
        <div
          className="inline-flex items-center gap-1"
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#FBBF24",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none">
            <path
              d="M12 3l2.5 6.4L21 10l-5 4.5L17.5 21 12 17.7 6.5 21 8 14.5 3 10l6.5-.6L12 3Z"
              fill="#FBBF24"
            />
          </svg>
          {friend.level}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "#71717A",
            marginTop: 2,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {friend.total_xp} XP
        </div>
      </div>
    </div>
  );
}

// ─── Joint habit cards ──────────────────────────────────────────
function JointHabitTile({ joint }: { joint: JointHabitOut }) {
  const glyph = glyphFor(joint.emoji);
  const accent = glyph?.color ?? "#A78BFA";
  return (
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: 13,
        flexShrink: 0,
        background: glyph
          ? `rgba(${parseInt(accent.slice(1, 3), 16)}, ${parseInt(
              accent.slice(3, 5),
              16,
            )}, ${parseInt(accent.slice(5, 7), 16)}, 0.14)`
          : "rgba(139,92,246,0.14)",
        border: "1px solid rgba(255,255,255,0.05)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {glyph ? (
        <Glyph name={glyph.name} size={22} color={accent} strokeWidth={1.9} />
      ) : (
        <span style={{ fontSize: 22 }}>{joint.emoji}</span>
      )}
    </div>
  );
}

function PartnerAvatar({ id, name }: { id: number; name: string }) {
  const c = avatarColor(id);
  const initial = name?.[0]?.toUpperCase() || "?";
  return (
    <div
      className="flex shrink-0 items-center justify-center"
      style={{
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: c.bg,
        color: "white",
        fontSize: 11,
        fontWeight: 700,
        border: "2px solid #1A1A24",
      }}
    >
      {initial}
    </div>
  );
}

function ActiveJointCard({
  joint,
  onLeave,
}: {
  joint: JointHabitOut;
  onLeave: () => void;
}) {
  const both = joint.you_done_today && joint.partner_done_today;
  const someone = joint.you_done_today || joint.partner_done_today;

  return (
    <div
      style={{
        padding: 14,
        borderRadius: 16,
        background: both
          ? "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(5,150,105,0.02)), #1A1A24"
          : "#1A1A24",
        border: both
          ? "1px solid rgba(16,185,129,0.18)"
          : "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="flex items-start gap-3">
        <JointHabitTile joint={joint} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "rgba(255,255,255,0.95)",
                letterSpacing: "-0.01em",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {joint.name}
            </div>
            {joint.shared_streak > 0 && (
              <div
                className="inline-flex shrink-0 items-center gap-1"
                style={{
                  padding: "2px 8px 2px 6px",
                  borderRadius: 999,
                  background: "rgba(251,146,60,0.14)",
                  color: "#FB923C",
                  fontSize: 11,
                  fontWeight: 600,
                  fontVariantNumeric: "tabular-nums",
                  lineHeight: 1,
                }}
              >
                <svg width={10} height={11} viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 3.5c.8 2.4 3.5 3.8 3.5 7.5a3.5 3.5 0 0 1-7 0c0-1.2.5-2 1.2-2.5 0 1.3.5 1.8 1 1.8-.2-1.8-.8-3 1.3-6.8Z"
                    stroke="#FB923C"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
                {joint.shared_streak}
              </div>
            )}
          </div>

          <div
            className="flex items-center gap-1.5 mt-1"
            style={{ fontSize: 12, color: "#A1A1AA" }}
          >
            <PartnerAvatar
              id={joint.partner.id}
              name={joint.partner.first_name}
            />
            <span>с {joint.partner.first_name}</span>
          </div>

          <div className="mt-2 flex items-center gap-3">
            <CheckMark done={joint.you_done_today} label="ты" />
            <CheckMark
              done={joint.partner_done_today}
              label={joint.partner.first_name}
            />
            {both ? (
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 11,
                  color: "#34D399",
                  fontWeight: 600,
                }}
              >
                День засчитан ✓
              </span>
            ) : someone ? (
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 11,
                  color: "#FBBF24",
                  fontWeight: 500,
                }}
              >
                Ждём второго…
              </span>
            ) : null}
          </div>
        </div>
        <button
          onClick={onLeave}
          className="shrink-0"
          style={{
            background: "transparent",
            border: "none",
            color: "#71717A",
            cursor: "pointer",
            padding: 4,
          }}
          title="Прекратить"
          aria-label="Прекратить"
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <path
              d="M6 6l12 12M6 18L18 6"
              stroke="#71717A"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

function CheckMark({ done, label }: { done: boolean; label: string }) {
  return (
    <div
      className="inline-flex items-center gap-1"
      style={{
        fontSize: 11.5,
        color: done ? "#34D399" : "#71717A",
        fontWeight: done ? 600 : 400,
      }}
    >
      <div
        className="flex items-center justify-center"
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: done ? "#10B981" : "transparent",
          border: done ? "none" : "1.5px solid rgba(255,255,255,0.14)",
        }}
      >
        {done && (
          <svg width={10} height={10} viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12.5l4.5 4.5L19 7.5"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      {label}
    </div>
  );
}

function IncomingInvitationCard({
  joint,
  onAccept,
  onDecline,
}: {
  joint: JointHabitOut;
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 16,
        background:
          "linear-gradient(135deg, rgba(139,92,246,0.10), rgba(99,102,241,0.04)), #1A1A24",
        border: "1px solid rgba(139,92,246,0.28)",
      }}
    >
      <div className="flex items-center gap-3">
        <JointHabitTile joint={joint} />
        <div className="flex-1 min-w-0">
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "rgba(255,255,255,0.95)",
              letterSpacing: "-0.01em",
            }}
          >
            {joint.name}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "#A1A1AA",
              marginTop: 1,
            }}
          >
            <b style={{ color: "rgba(255,255,255,0.9)" }}>
              {joint.partner.first_name}
            </b>{" "}
            приглашает делать вместе
          </div>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          onClick={onDecline}
          className="flex-1 py-2 text-sm font-medium"
          style={{
            borderRadius: 10,
            background: "#0A0A0F",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#A1A1AA",
            cursor: "pointer",
          }}
        >
          Отклонить
        </button>
        <button
          onClick={onAccept}
          className="flex-1 py-2 text-sm font-semibold text-white"
          style={{
            borderRadius: 10,
            background: "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
            boxShadow: "0 4px 12px -2px rgba(139,92,246,0.4)",
            cursor: "pointer",
          }}
        >
          Принять
        </button>
      </div>
    </div>
  );
}

function SentInvitationCard({
  joint,
  onCancel,
}: {
  joint: JointHabitOut;
  onCancel: () => void;
}) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 16,
        background: "#1A1A24",
        border: "1px dashed rgba(255,255,255,0.14)",
      }}
    >
      <div className="flex items-center gap-3">
        <div style={{ opacity: 0.7 }}>
          <JointHabitTile joint={joint} />
        </div>
        <div className="flex-1 min-w-0">
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "rgba(255,255,255,0.85)",
              letterSpacing: "-0.01em",
            }}
          >
            {joint.name}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "#A1A1AA",
              marginTop: 1,
            }}
          >
            Ждём ответа от <b>{joint.partner.first_name}</b>…
          </div>
        </div>
        <button
          onClick={onCancel}
          className="shrink-0"
          style={{
            padding: "4px 10px",
            borderRadius: 8,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
            color: "#A1A1AA",
            cursor: "pointer",
            fontSize: 12,
          }}
          title="Отменить"
        >
          Отменить
        </button>
      </div>
    </div>
  );
}

function JointHabitsEmptyState({
  hasFriends,
  onCreate,
}: {
  hasFriends: boolean;
  onCreate: () => void;
}) {
  return (
    <CardSurface style={{ padding: 22, textAlign: "center" }}>
      <div
        className="mx-auto mb-2 flex items-center justify-center"
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          background: "rgba(139,92,246,0.14)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <svg width={26} height={26} viewBox="0 0 24 24" fill="none">
          <circle cx="9" cy="8" r="3" stroke="#A78BFA" strokeWidth="1.7" />
          <circle cx="17" cy="9" r="2.2" stroke="#A78BFA" strokeWidth="1.7" />
          <path
            d="M3.5 19c.6-2.6 2.8-4 5.5-4s4.9 1.4 5.5 4"
            stroke="#A78BFA"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <path
            d="M16 18.5c.3-1.7 1.5-2.8 3-2.8s2.4 1 2.7 2.3"
            stroke="#A78BFA"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <p
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "rgba(255,255,255,0.95)",
        }}
      >
        Делайте привычки вместе
      </p>
      <p
        style={{
          fontSize: 12,
          color: "#A1A1AA",
          marginTop: 4,
          lineHeight: 1.4,
        }}
      >
        Создавай общие привычки с друзьями — стрик растёт только когда оба отметили
      </p>
      {hasFriends && (
        <button
          onClick={onCreate}
          className="mt-3 inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
          style={{
            background: "linear-gradient(135deg, #8B5CF6, #6366F1)",
            boxShadow: "0 4px 12px -2px rgba(139,92,246,0.4)",
            cursor: "pointer",
          }}
        >
          Создать
        </button>
      )}
    </CardSurface>
  );
}

// ─── Activity feed entry ────────────────────────────────────────
function FeedEntry({ item }: { item: FeedItem }) {
  const time = formatRelative(new Date(item.created_at));
  const name = item.user_first_name;
  const p = item.payload as Record<string, unknown>;

  let icon = "📝";
  let text: React.ReactNode = "сделал что-то";
  let iconBg = "rgba(255,255,255,0.05)";

  if (item.event_type === "checkin") {
    icon = (p.habit_emoji as string) || "✅";
    iconBg = "rgba(52,211,153,0.14)";
    const habit = (p.habit_name as string) || "привычку";
    const streak = (p.streak as number) || 0;
    text = (
      <>
        выполнил <b style={{ color: "rgba(255,255,255,0.95)" }}>{habit}</b>
        {streak > 1 && (
          <span style={{ color: "#FB923C", marginLeft: 6 }}>· 🔥 {streak}</span>
        )}
      </>
    );
  } else if (item.event_type === "achievement") {
    icon = (p.icon as string) || "🏆";
    iconBg = "rgba(251,191,36,0.14)";
    text = (
      <>
        получил награду{" "}
        <b style={{ color: "rgba(255,255,255,0.95)" }}>«{p.name as string}»</b>
      </>
    );
  } else if (item.event_type === "level_up") {
    icon = "🎖";
    iconBg = "rgba(139,92,246,0.14)";
    text = (
      <>
        вышел на уровень{" "}
        <b style={{ color: "rgba(255,255,255,0.95)" }}>{p.new_level as number}</b>
      </>
    );
  }

  return (
    <div
      className="flex items-start gap-3"
      style={{
        padding: "12px 14px",
        borderRadius: 16,
        background: "#1A1A24",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div
        className="flex shrink-0 items-center justify-center"
        style={{
          width: 36,
          height: 36,
          borderRadius: 11,
          background: iconBg,
          border: "1px solid rgba(255,255,255,0.05)",
          fontSize: 18,
        }}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p style={{ fontSize: 13, color: "#A1A1AA", lineHeight: 1.4 }}>
          <b style={{ color: "rgba(255,255,255,0.95)" }}>{name}</b> {text}
        </p>
        <p
          style={{
            marginTop: 2,
            fontSize: 11,
            color: "#71717A",
          }}
        >
          {time}
        </p>
      </div>
    </div>
  );
}

function formatRelative(d: Date): string {
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "только что";
  if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} дн назад`;
  return d.toLocaleDateString("ru-RU");
}
