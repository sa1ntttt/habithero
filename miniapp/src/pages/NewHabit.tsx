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
      tg?.HapticFeedback?.notificationOccurred?.("success");
      navigate(`/habits/${habit.id}`);
    } catch (e) {
      setErr((e as Error).message);
      tg?.HapticFeedback?.notificationOccurred?.("error");
    } finally {
      setBusy(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    background: "#1A1A24",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "rgba(255,255,255,0.95)",
    borderRadius: 12,
    fontSize: 15,
  };

  return (
    <div className="flex flex-col gap-4 text-white pb-32">
      {/* ─── Header ───────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-0.5 self-start bg-transparent border-0 p-0 cursor-pointer"
        style={{ color: "#A78BFA", fontSize: 15 }}
      >
        <svg width={17} height={17} viewBox="0 0 24 24" fill="none">
          <path
            d="M15 6l-6 6 6 6"
            stroke="#A78BFA"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Назад
      </button>

      <h1
        style={{
          margin: 0,
          fontSize: 26,
          fontWeight: 600,
          letterSpacing: "-0.4px",
          color: "rgba(255,255,255,0.95)",
        }}
      >
        Новая привычка
      </h1>

      {/* ─── Name ─────────────────────────────────────────── */}
      <Field label="Название">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Например, Зарядка"
          maxLength={64}
          className="w-full px-4 py-3 outline-none focus:ring-2 focus:ring-[#8B5CF6]"
          style={inputStyle}
        />
      </Field>

      {/* ─── Emoji ────────────────────────────────────────── */}
      <Field label="Эмодзи">
        <EmojiPicker value={emoji} onChange={setEmoji} />
      </Field>

      {/* ─── Habit type ───────────────────────────────────── */}
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
              className="w-full px-4 py-3 outline-none focus:ring-2 focus:ring-[#8B5CF6]"
              style={inputStyle}
            />
          </Field>
          <Field label="Единица">
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="стаканов"
              maxLength={32}
              className="w-full px-4 py-3 outline-none focus:ring-2 focus:ring-[#8B5CF6]"
              style={inputStyle}
            />
          </Field>
        </div>
      )}

      {/* ─── Schedule ─────────────────────────────────────── */}
      <Field label="Расписание">
        <ScheduleEditor value={schedule} onChange={setSchedule} />
      </Field>

      {/* ─── Description ──────────────────────────────────── */}
      <Field label="Описание (необязательно)">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={256}
          rows={2}
          placeholder="Зачем эта привычка?"
          className="w-full px-4 py-3 outline-none focus:ring-2 focus:ring-[#8B5CF6]"
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </Field>

      {err && (
        <p style={{ fontSize: 13, color: "#F87171" }}>{err}</p>
      )}

      {/* ─── Sticky CTA ───────────────────────────────────── */}
      <div
        className="fixed inset-x-0 bottom-16 mx-auto max-w-md p-4"
        style={{
          background:
            "linear-gradient(to top, #0A0A0F 60%, rgba(10,10,15,0.6) 90%, rgba(10,10,15,0) 100%)",
          paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)",
        }}
      >
        <button
          onClick={submit}
          disabled={!canSubmit}
          className="w-full py-3.5 text-base font-semibold text-white disabled:opacity-50"
          style={{
            borderRadius: 14,
            background: "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
            boxShadow: canSubmit
              ? "0 8px 24px -6px rgba(139,92,246,0.5), 0 1px 0 rgba(255,255,255,0.18) inset"
              : "none",
            cursor: canSubmit ? "pointer" : "default",
          }}
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
      <p
        style={{
          marginBottom: 8,
          fontSize: 12,
          fontWeight: 600,
          color: "#71717A",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </p>
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
      className="text-left"
      style={{
        padding: "12px 14px",
        borderRadius: 14,
        background: active
          ? "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)"
          : "#1A1A24",
        border: active
          ? "1px solid rgba(255,255,255,0.18)"
          : "1px solid rgba(255,255,255,0.08)",
        boxShadow: active
          ? "0 4px 12px -2px rgba(139,92,246,0.4)"
          : "none",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "white",
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 12,
          color: active ? "rgba(255,255,255,0.85)" : "#A1A1AA",
          marginTop: 2,
        }}
      >
        {subtitle}
      </div>
    </button>
  );
}
