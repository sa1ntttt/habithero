import { Link, useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { schedulePreview } from "../utils/schedule";

export function Habits() {
  const habits = useAppStore((s) => s.habits);
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Привычки</h1>
        <button
          onClick={() => navigate("/habits/new")}
          className="rounded-xl bg-brand-500 px-3 py-2 text-sm font-medium text-white"
        >
          ➕ Создать
        </button>
      </div>

      {habits.length === 0 ? (
        <div className="rounded-2xl bg-tg-secondary-bg p-6 text-center">
          <p className="text-4xl">🌱</p>
          <p className="mt-2 text-sm text-tg-hint">
            Список пуст. Создай первую привычку!
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {habits.map((h) => (
            <li key={h.id}>
              <Link
                to={`/habits/${h.id}`}
                className="flex items-center gap-3 rounded-2xl bg-tg-secondary-bg p-4 active:scale-[0.99]"
              >
                <span className="text-3xl">{h.emoji}</span>
                <div className="flex-1">
                  <p className="font-semibold">{h.name}</p>
                  <p className="text-xs text-tg-hint">{schedulePreview(h.schedule)}</p>
                </div>
                {h.streak && h.streak.current_streak > 0 && (
                  <span className="text-sm font-medium text-orange-500">
                    🔥 {h.streak.current_streak}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
