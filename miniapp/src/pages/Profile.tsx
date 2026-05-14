import { useAppStore } from "../store/useAppStore";
import { useTelegram } from "../hooks/useTelegram";

export function Profile() {
  const user = useAppStore((s) => s.user);
  const { isInsideTelegram, colorScheme } = useTelegram();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Профиль</h1>

      {user ? (
        <div className="space-y-3">
          <Row label="Имя" value={user.first_name} />
          {user.username && <Row label="Username" value={`@${user.username}`} />}
          <Row label="Telegram ID" value={String(user.telegram_id)} />
          <Row label="Часовой пояс" value={user.timezone} />
          <Row label="Уровень" value={`${user.level} (${user.total_xp} XP)`} />
        </div>
      ) : (
        <p className="text-sm text-tg-hint">Данные пользователя не загружены.</p>
      )}

      <div className="mt-6 rounded-xl bg-tg-secondary-bg p-3 text-xs text-tg-hint">
        <p>Внутри Telegram: <b>{isInsideTelegram ? "да" : "нет"}</b></p>
        <p>Тема: <b>{colorScheme}</b></p>
      </div>
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
