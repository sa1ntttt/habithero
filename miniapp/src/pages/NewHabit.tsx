import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAppStore } from "../store/useAppStore";
import { useTelegram } from "../hooks/useTelegram";
import { EmojiPicker } from "../components/EmojiPicker";
import { ScheduleEditor, type ScheduleValue } from "../components/ScheduleEditor";
import type { HabitType } from "../types/api";

export function NewHabit() {
  const navigate = useNavigate();
  const upsertHabit = useAppStore((s) => s.upsertHabit);
  const { tg } = useTelegram();

  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("✅");
  const [description, setDescription] = useState("");
  const [habitType, setHabitType] = useState<HabitType>("binary");
  const [targetValue, setTargetValue] = useState<string>("8");
  const [unit, setUnit] = useState<string>("раз");
  const [schedule, setSchedule] = useState<ScheduleValue>({ type: "daily" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const targetNumber = Number(targetValue.replace(",", "."));
  const isQuantityValid =
    habitType !== "quantity" ||
    (Number.isFinite(targetNumber) && targetNumber > 0 && unit.trim().length > 0);

  const canSubmit = name.trim().length >= 2 && isQuantityValid && !busy;

  const submit = async () => {
    setErr(null);
    if (!canSubmit) return;
    setBusy(true);
    try {
      const habit = await api.createHabit({
        name: name.trim(),
        emoji,
        description: description.trim() || null,
        type: habitType,
        target_value: habitType === "quantity" ? targetNumber : null,
        unit: habitType === "quantity" ? unit.trim() : null,
        schedule: schedule as unknown as Record<string, unknown>,
      });
      upsertHabit(habit);
      tg?.HapticFeedback?.notificationOccurred("success");
      navigate(`/habits/${habit.id}`);
    } catch (e) {
      setErr((e as Error).message);
      tg?.HapticFeedback?.notificationOccurred("error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4 pb-32">
      <button onClick={() => navigate(-1)} className="text-sm text-tg-link">
        ← Назад
      </button>

      <h1 className="text-2xl font-bold">Новая привычка</h1>

      <Field label="Название">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Например, Зарядка"
          maxLength={64}
          className="w-full rounded-xl bg-tg-secondary-bg px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500"
        />
      </Field>

      <Field label="Эмодзи">
        <EmojiPicker value={emoji} onChange={setEmoji} />
      </Field>

      <Field label="Тип привычки">
        <div className="grid grid-cols-2 gap-2">
          <TypeBtn
            active={habitType === "binary"}
            onClick={() => setHabitType("binary")}
            title="Бинарная"
            subtitle="✅ Выполнил / нет"
          />
          <TypeBtn
            active={habitType === "quantity"}
            onClick={() => setHabitType("quantity")}
            title="Количественная"
            subtitle="📊 С целью"
          />
        </div>
      </Field>

      {habitType === "quantity" && (
        <div className="grid grid-cols-2 gap-2">
          <Field label="Цель в день">
            <input
              type="number"
              inputMode="decimal"
              step="any"
              min="0.1"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              placeholder="8"
              className="w-full rounded-xl bg-tg-secondary-bg px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500"
            />
          </Field>
          <Field label="Единица">
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="стаканов"
              maxLength={32}
              className="w-full rounded-xl bg-tg-secondary-bg px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500"
            />
          </Field>
        </div>
      )}

      <Field label="Расписание">
        <ScheduleEditor value={schedule} onChange={setSchedule} />
      </Field>

      <Field label="Описание (необязательно)">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={256}
          rows={2}
          placeholder="Зачем эта привычка?"
          className="w-full rounded-xl bg-tg-secondary-bg px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500"
        />
      </Field>

      {err && <p className="text-sm text-red-600">{err}</p>}

      <div className="fixed inset-x-0 bottom-20 mx-auto max-w-md p-4">
        <button
          onClick={submit}
          disabled={!canSubmit}
          className="w-full rounded-xl bg-brand-500 py-3 text-base font-semibold text-white shadow-lg disabled:opacity-50"
        >
          {busy ? "Создаём…" : "Создать привычку"}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-tg-hint">{label}</p>
      {children}
    </div>
  );
}

function TypeBtn({
  active,
  onClick,
  title,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-3 py-3 text-left ${
        active ? "bg-brand-500 text-white" : "bg-tg-secondary-bg text-tg-text"
      }`}
    >
      <div className="text-sm font-semibold">{title}</div>
      <div className={`text-xs ${active ? "opacity-90" : "text-tg-hint"}`}>{subtitle}</div>
    </button>
  );
}
