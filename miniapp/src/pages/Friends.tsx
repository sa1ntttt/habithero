import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useTelegram } from "../hooks/useTelegram";
import type { FriendOut, FeedItem, InviteLinkOut } from "../types/api";

export function Friends() {
  const { tg } = useTelegram();
  const [friends, setFriends] = useState<FriendOut[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [invite, setInvite] = useState<InviteLinkOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [f, l, i] = await Promise.all([
          api.listFriends(),
          api.getFeed(50, 30),
          api.getInviteLink(),
        ]);
        if (!cancelled) {
          setFriends(f);
          setFeed(l);
          setInvite(i);
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
    // Telegram WebApp has openLink to share URLs natively
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
      tg?.HapticFeedback?.notificationOccurred("success");
      alert("Ссылка скопирована!");
    } catch {
      // fallback: just show alert
      alert(invite.link);
    }
  };

  return (
    <div className="space-y-4 pb-8">
      <h1 className="text-2xl font-bold">Друзья</h1>

      {err && <p className="text-sm text-red-600">{err}</p>}
      {loading && <p className="text-sm text-tg-hint">Загрузка…</p>}

      {/* Invite section */}
      <section className="rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 p-5 text-white">
        <h2 className="text-lg font-semibold">🤝 Пригласить друга</h2>
        <p className="mt-1 text-sm opacity-90">
          Поделись ссылкой — кто перейдёт, станет твоим другом.
        </p>
        <div className="mt-3 flex gap-2">
          <button
            onClick={shareInvite}
            className="flex-1 rounded-xl bg-white py-2 font-semibold text-brand-700"
          >
            📤 Поделиться
          </button>
          <button
            onClick={copyLink}
            className="rounded-xl bg-white/20 px-4 font-semibold text-white"
          >
            📋
          </button>
        </div>
      </section>

      {/* Friends list */}
      <section>
        <h2 className="mb-2 text-lg font-semibold">
          Твои друзья ({friends.length})
        </h2>
        {friends.length === 0 ? (
          <p className="rounded-2xl bg-tg-secondary-bg p-4 text-sm text-tg-hint">
            Пока никого нет. Поделись ссылкой выше — и друзья появятся 👆
          </p>
        ) : (
          <ul className="space-y-2">
            {friends.map((f) => (
              <li
                key={f.id}
                className="flex items-center gap-3 rounded-2xl bg-tg-secondary-bg p-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 font-bold text-white">
                  {f.first_name[0]?.toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{f.first_name}</p>
                  {f.username && (
                    <p className="text-xs text-tg-hint truncate">@{f.username}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">⭐ {f.level}</p>
                  <p className="text-xs text-tg-hint">{f.total_xp} XP</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Activity feed */}
      <section>
        <h2 className="mb-2 text-lg font-semibold">📰 Лента активности</h2>
        {feed.length === 0 ? (
          <p className="rounded-2xl bg-tg-secondary-bg p-4 text-sm text-tg-hint">
            Тут будут события — твои и друзей. Сделай отметку или открой ачивку!
          </p>
        ) : (
          <ul className="space-y-2">
            {feed.map((item) => (
              <FeedEntry key={item.id} item={item} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function FeedEntry({ item }: { item: FeedItem }) {
  const time = formatRelative(new Date(item.created_at));
  const name = item.user_first_name;
  const p = item.payload as Record<string, unknown>;

  let icon = "📝";
  let text = "сделал что-то";

  if (item.event_type === "checkin") {
    icon = (p.habit_emoji as string) || "✅";
    const habit = (p.habit_name as string) || "привычку";
    const streak = (p.streak as number) || 0;
    text = `выполнил ${habit}${streak > 1 ? ` · 🔥 ${streak}` : ""}`;
  } else if (item.event_type === "achievement") {
    icon = (p.icon as string) || "🏆";
    text = `получил достижение «${p.name}»`;
  } else if (item.event_type === "level_up") {
    icon = "🎖️";
    text = `вышел на уровень ${p.new_level}`;
  }

  return (
    <li className="flex items-start gap-3 rounded-2xl bg-tg-secondary-bg p-3">
      <span className="text-2xl">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <b>{name}</b> {text}
        </p>
        <p className="mt-0.5 text-xs text-tg-hint">{time}</p>
      </div>
    </li>
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
