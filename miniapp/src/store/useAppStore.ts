import { create } from "zustand";
import type { UserOut, HabitOut, TodayItem, AccessOut } from "../types/api";

interface AppState {
  user: UserOut | null;
  habits: HabitOut[];
  today: TodayItem[];
  todayDate: string | null;
  access: AccessOut | null;
  loading: boolean;
  error: string | null;

  setUser: (user: UserOut | null) => void;
  setHabits: (habits: HabitOut[]) => void;
  upsertHabit: (habit: HabitOut) => void;
  removeHabit: (id: number) => void;
  setToday: (date: string, items: TodayItem[]) => void;
  updateTodayItem: (habitId: number, patch: Partial<TodayItem>) => void;
  setAccess: (access: AccessOut | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  habits: [],
  today: [],
  todayDate: null,
  access: null,
  loading: false,
  error: null,

  setUser: (user) => set({ user }),
  setHabits: (habits) => set({ habits }),
  upsertHabit: (habit) =>
    set((s) => {
      const idx = s.habits.findIndex((h) => h.id === habit.id);
      if (idx === -1) return { habits: [habit, ...s.habits] };
      const next = [...s.habits];
      next[idx] = habit;
      return { habits: next };
    }),
  removeHabit: (id) => set((s) => ({ habits: s.habits.filter((h) => h.id !== id) })),
  setToday: (date, items) => set({ todayDate: date, today: items }),
  updateTodayItem: (habitId, patch) =>
    set((s) => ({
      today: s.today.map((it) =>
        it.habit.id === habitId ? { ...it, ...patch } : it
      ),
    })),
  setAccess: (access) => set({ access }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
