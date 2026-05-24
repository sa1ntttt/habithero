import { useState } from "react";
import { EmojiPicker } from "./EmojiPicker";
import { ScheduleEditor, type ScheduleValue } from "./ScheduleEditor";
import { api } from "../api/client";
import { useTelegram } from "../hooks/useTelegram";
import type { FriendOut, JointHabitOut } from "../types/api";

interface Props {
  friends: FriendOut[];
  onClose: () => void;
  onCreated: (joint: JointHabitOut) => void;
}

export function CreateJointHabitModal({ friends, onClose, onCreated }: Props) {
  const { tg } = useTelegram();
  const [partnerId, setPartnerId] = useState<number | null>(
    friends[0]?.id ?? null,
  );
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🤝");
  const [schedule, setSchedule] = useState<ScheduleValue>({ type: "daily" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const canSubmit = partnerId !== null && name.trim().length >= 2 && !busy;

  const submit = async () => {
    if (!canSubmit || partnerId === null) return;
    setBusy(true);
    setErr(null);
    try {
      const joint = await api.createJointHabit({
        partner_user_id: partnerId,
        name: name.trim(),
        emoji,
        schedule: schedule as unknown as Record<string, unknown>,
      });
      tg?.HapticFeedback?.notificationOccurred?.("success");
      onCreated(joint);
    } catch (e) {
      setErr((e as Error).message);
      tg?.HapticFeedback?.notificationOccurred?.("error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md text-white"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#0A0A0F",
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          padding: "18px 18px calc(env(safe-area-inset-bottom) + 22px)",
          maxHeight: "92vh",
          overflowY: "auto",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Drag handle */}
        <div
          className="mx-auto mb-4"
          style={{
            width: 48,
            height: 4,
            borderRadius: 2,
            background: "rgba(255,255,255,0.15)",
          }}
        />

        <h2
          style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 700,
            color: "rgba(255,255,255,0.95)",
            letterSpacing: "-0.02em",
          }}
        >
          Совместная привычка
        </h2>
        <p
          style={{
            marginTop: 4,
            marginBottom: 16,
            fontSize: 13,
            color: "#A1A1AA",
            lineHeight: 1.4,
          }}
        >
          Стрик растёт только в дни, когда оба отметили.
        </p>

        {friends.length === 0 ? (
          <div
            style={{
              padding: 16,
              borderRadius: 12,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              fontSize: 13,
              color: "#A1A1AA",
              lineHeight: 1.4,
            }}
          >
            Сначала добавь хотя бы одного друга на экране Друзья.
          </div>
        ) : (
          <>
            <Field label="С кем">
              <select
                value={partnerId ?? ""}
                onChange={(e) => setPartnerId(Number(e.target.value))}
                className="w-full px-4 py-3 outline-none"
                style={{
                  background: "#1A1A24",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.95)",
                  borderRadius: 12,
                  fontSize: 15,
                  appearance: "none",
                }}
              >
                {friends.map((f) => (
                  <option
                    key={f.id}
                    value={f.id}
                    style={{ background: "#1A1A24", color: "white" }}
                  >
                    {f.first_name}
                    {f.username ? ` · @${f.username}` : ""}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Название">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Например, Зарядка вдвоём"
                maxLength={64}
                className="w-full px-4 py-3 outline-none focus:ring-2 focus:ring-[#8B5CF6]"
                style={{
                  background: "#1A1A24",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.95)",
                  borderRadius: 12,
                  fontSize: 15,
                }}
              />
            </Field>

            <Field label="Эмодзи">
              <EmojiPicker value={emoji} onChange={setEmoji} />
            </Field>

            <Field label="Расписание">
              <ScheduleEditor value={schedule} onChange={setSchedule} />
            </Field>

            {err && (
              <p
                style={{
                  marginTop: 8,
                  fontSize: 13,
                  color: "#F87171",
                }}
              >
                {err}
              </p>
            )}

            <div className="flex gap-2 mt-5">
              <button
                onClick={onClose}
                className="flex-1 py-3 text-sm font-medium"
                style={{
                  borderRadius: 12,
                  background: "#1A1A24",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.95)",
                  cursor: "pointer",
                }}
              >
                Отмена
              </button>
              <button
                onClick={submit}
                disabled={!canSubmit}
                className="flex-1 py-3 text-sm font-semibold text-white disabled:opacity-50"
                style={{
                  borderRadius: 12,
                  background:
                    "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
                  boxShadow: canSubmit
                    ? "0 4px 12px -2px rgba(139,92,246,0.4)"
                    : "none",
                  cursor: canSubmit ? "pointer" : "default",
                }}
              >
                {busy ? "Отправляем…" : "Пригласить"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
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
