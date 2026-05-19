import type {
  UserOut,
  HabitOut,
  HabitLogOut,
  CheckinResponse,
  OverallStats,
  TodayResponse,
  ReminderOut,
  ReminderCreate,
} from "../types/api";

// Empty by default → relative paths (Vite proxy handles /api/* to backend).
// Set VITE_API_URL only if you need to point at a different backend host.
const API_URL = import.meta.env.VITE_API_URL || "";
const DEV_MODE = import.meta.env.VITE_DEV_MODE === "true";

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

function getInitData(): string {
  const initData = window.Telegram?.WebApp?.initData;
  if (initData) return initData;

  if (DEV_MODE) {
    // In dev (regular browser) we have no real initData — backend will reject.
    // Use bot for real testing.
    console.warn("[HabitHero] no Telegram WebApp initData; backend calls will fail until run inside Telegram.");
    return "";
  }

  throw new Error("Telegram WebApp is not available");
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  headers.set("X-Telegram-Init-Data", getInitData());

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      // body not JSON
    }
    throw new ApiError(res.status, detail);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  getMe: () => request<UserOut>("/api/me"),
  updateMe: (payload: Partial<Pick<UserOut, "timezone" | "language">>) =>
    request<UserOut>("/api/me", { method: "PATCH", body: JSON.stringify(payload) }),

  listHabits: () => request<HabitOut[]>("/api/habits"),
  createHabit: (payload: Partial<HabitOut>) =>
    request<HabitOut>("/api/habits", { method: "POST", body: JSON.stringify(payload) }),
  getHabit: (id: number) => request<HabitOut>(`/api/habits/${id}`),
  updateHabit: (id: number, payload: Partial<HabitOut>) =>
    request<HabitOut>(`/api/habits/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  archiveHabit: (id: number) => request<void>(`/api/habits/${id}`, { method: "DELETE" }),

  getLogs: (habitId: number, start: string, end: string) =>
    request<HabitLogOut[]>(`/api/habits/${habitId}/logs?start=${start}&end=${end}`),

  checkin: (habitId: number, payload: { log_date?: string; value?: number; note?: string } = {}) =>
    request<CheckinResponse>(`/api/habits/${habitId}/checkin`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  resetToday: (habitId: number) =>
    request<void>(`/api/habits/${habitId}/reset_today`, { method: "POST" }),

  getStats: () => request<OverallStats>("/api/stats"),
  getToday: () => request<TodayResponse>("/api/today"),
  getLogsRange: (start: string, end: string) =>
    request<HabitLogOut[]>(`/api/logs?start=${start}&end=${end}`),

  listReminders: (habitId: number) =>
    request<ReminderOut[]>(`/api/habits/${habitId}/reminders`),
  createReminder: (habitId: number, payload: ReminderCreate) =>
    request<ReminderOut>(`/api/habits/${habitId}/reminders`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateReminder: (id: number, payload: Partial<ReminderCreate>) =>
    request<ReminderOut>(`/api/reminders/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  deleteReminder: (id: number) =>
    request<void>(`/api/reminders/${id}`, { method: "DELETE" }),
};

export { ApiError };
