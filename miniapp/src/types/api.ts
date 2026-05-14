export interface UserOut {
  id: number;
  telegram_id: number;
  username: string | null;
  first_name: string;
  timezone: string;
  language: string;
  level: number;
  total_xp: number;
  created_at: string;
}

export interface StreakOut {
  current_streak: number;
  longest_streak: number;
  last_check_date: string | null;
  freezes_available: number;
}

export type HabitType = "binary" | "quantity" | "timer";

export interface HabitOut {
  id: number;
  name: string;
  description: string | null;
  emoji: string;
  color: string;
  type: HabitType;
  target_value: number | null;
  unit: string | null;
  schedule: Record<string, unknown>;
  is_archived: boolean;
  created_at: string;
  streak: StreakOut | null;
}

export interface HabitLogOut {
  id: number;
  habit_id: number;
  log_date: string;
  value: number | null;
  status: "done" | "skipped" | "failed";
  note: string | null;
  created_at: string;
}

export interface CheckinResponse {
  log: HabitLogOut;
  streak: StreakOut;
  streak_grew: boolean;
  freezes_used: number;
}

export interface OverallStats {
  total_habits: number;
  active_habits: number;
  total_checkins: number;
  longest_streak: number;
  current_active_streaks: number;
}

export interface TodayItem {
  habit: HabitOut;
  log: HabitLogOut | null;
}

export interface TodayResponse {
  date: string;
  items: TodayItem[];
}

export interface ReminderOut {
  id: number;
  habit_id: number;
  time: string; // "HH:MM:SS"
  days_of_week: number[];
  is_active: boolean;
  last_sent_at: string | null;
  created_at: string;
}

export interface ReminderCreate {
  time: string; // "HH:MM"
  days_of_week?: number[];
  is_active?: boolean;
}
