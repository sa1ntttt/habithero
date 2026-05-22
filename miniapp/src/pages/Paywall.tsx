import { useState } from "react";
import { api } from "../api/client";
import { useAppStore } from "../store/useAppStore";
import { useTelegram } from "../hooks/useTelegram";
import type { SubscriptionPlan } from "../types/api";

interface TelegramInvoiceApi {
  openInvoice?: (
    url: string,
    callback?: (status: "paid" | "cancelled" | "failed" | "pending") => void,
  ) => void;
}

export function Paywall() {
  const { tg } = useTelegram();
  const setAccess = useAppStore((s) => s.setAccess);
  const [busy, setBusy] = useState<SubscriptionPlan | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const buy = async (plan: SubscriptionPlan) => {
    setBusy(plan);
    setErr(null);
    try {
      const { invoice_link } = await api.createInvoice(plan);

      const tgInv = tg as unknown as TelegramInvoiceApi;
      if (!tgInv.openInvoice) {
        // Fallback for non-Telegram environments — open in new tab
        window.open(invoice_link, "_blank");
        setBusy(null);
        return;
      }

      tgInv.openInvoice(invoice_link, async (status) => {
        if (status === "paid") {
          tg?.HapticFeedback?.notificationOccurred?.("success");
          // Refetch access — backend has already extended paid_until via the bot
          try {
            const next = await api.getAccess();
            setAccess(next);
          } catch {
            // soft fail — user can reload manually
          }
        } else if (status === "failed") {
          setErr("Платёж не прошёл. Попробуй ещё раз.");
          tg?.HapticFeedback?.notificationOccurred?.("error");
        }
        // "cancelled" / "pending" — leave silently
        setBusy(null);
      });
    } catch (e) {
      setErr((e as Error).message);
      setBusy(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col text-white"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% 0%, #14101e 0%, #07070b 60%), #0A0A0F",
        padding: "calc(env(safe-area-inset-top) + 24px) 20px 20px",
        overflowY: "auto",
      }}
    >
      {/* Top crown + title */}
      <div className="flex flex-col items-center text-center mt-6">
        <div
          className="flex items-center justify-center mb-4"
          style={{
            width: 88,
            height: 88,
            borderRadius: 24,
            background:
              "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.25), rgba(139,92,246,0.05) 60%), linear-gradient(135deg, #8B5CF6, #6366F1)",
            border: "1px solid rgba(255,255,255,0.18)",
            boxShadow:
              "0 1px 0 rgba(255,255,255,0.3) inset, 0 18px 40px -10px rgba(139,92,246,0.6)",
          }}
        >
          <svg width={44} height={44} viewBox="0 0 24 24" fill="none">
            <path
              d="M3 8l3 10h12l3-10-5 3-4-6-4 6-5-3Z"
              stroke="white"
              strokeWidth="1.8"
              strokeLinejoin="round"
              fill="rgba(255,255,255,0.18)"
            />
            <path
              d="M3 20h18"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "rgba(255,255,255,0.95)",
          }}
        >
          Пробный период закончился
        </h1>
        <p
          style={{
            marginTop: 10,
            fontSize: 14,
            color: "#A1A1AA",
            lineHeight: 1.4,
            maxWidth: 320,
          }}
        >
          Открой полный доступ ко всем функциям —
          оплата через Telegram Stars в один тап.
        </p>
      </div>

      {/* Plans */}
      <div className="flex flex-col gap-3 mt-7">
        <PlanCard
          title="Навсегда"
          subtitle="Разовая оплата, доступ без ограничений"
          stars={500}
          highlight
          busy={busy === "lifetime"}
          disabled={busy !== null}
          onClick={() => buy("lifetime")}
        />
        <PlanCard
          title="На месяц"
          subtitle="Доступ ко всем функциям на 30 дней"
          stars={150}
          busy={busy === "month"}
          disabled={busy !== null}
          onClick={() => buy("month")}
        />
      </div>

      {/* Features */}
      <div className="mt-6 flex flex-col gap-2.5">
        <FeatureRow text="Безлимит привычек и напоминаний" />
        <FeatureRow text="Полная статистика и графики" />
        <FeatureRow text="Награды и система уровней" />
        <FeatureRow text="Друзья и совместные привычки" />
      </div>

      {err && (
        <p
          className="mt-4 text-center"
          style={{ fontSize: 13, color: "#F87171" }}
        >
          {err}
        </p>
      )}

      <div className="flex-1" />

      <p
        className="text-center"
        style={{
          marginTop: 16,
          fontSize: 11,
          color: "#52525B",
          lineHeight: 1.5,
        }}
      >
        Оплата через Telegram Stars. Платёж разовый,
        автопродление отключено.
      </p>
    </div>
  );
}

function PlanCard({
  title,
  subtitle,
  stars,
  highlight = false,
  busy = false,
  disabled = false,
  onClick,
}: {
  title: string;
  subtitle: string;
  stars: number;
  highlight?: boolean;
  busy?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="relative w-full text-left disabled:opacity-60"
      style={{
        padding: "18px 18px",
        borderRadius: 18,
        background: highlight
          ? "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)"
          : "#1A1A24",
        border: highlight
          ? "1px solid rgba(255,255,255,0.18)"
          : "1px solid rgba(255,255,255,0.08)",
        boxShadow: highlight
          ? "0 18px 36px -16px rgba(99,102,241,0.50), 0 1px 0 rgba(255,255,255,0.14) inset"
          : "0 1px 0 rgba(255,255,255,0.04) inset",
        cursor: disabled ? "default" : "pointer",
      }}
    >
      {highlight && (
        <div
          className="absolute"
          style={{
            top: -10,
            right: 16,
            padding: "4px 10px",
            borderRadius: 999,
            background: "#FBBF24",
            color: "#1A1A24",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            boxShadow: "0 4px 12px -2px rgba(251,191,36,0.4)",
          }}
        >
          выгодно
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "white",
              letterSpacing: "-0.01em",
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 12.5,
              color: highlight ? "rgba(255,255,255,0.8)" : "#A1A1AA",
              marginTop: 3,
              lineHeight: 1.3,
            }}
          >
            {subtitle}
          </div>
        </div>
        <div
          className="flex items-center gap-1 shrink-0 ml-3"
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "white",
            fontVariantNumeric: "tabular-nums",
            letterSpacing: "-0.02em",
          }}
        >
          {busy ? (
            <span style={{ fontSize: 14, opacity: 0.7 }}>…</span>
          ) : (
            <>
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 3l2.6 6.4 6.9.6-5.2 4.5 1.6 6.8L12 18.2 6.1 21.3l1.6-6.8L2.5 10l6.9-.6L12 3Z"
                  fill="#FBBF24"
                  stroke="#FBBF24"
                  strokeWidth="1"
                />
              </svg>
              {stars}
            </>
          )}
        </div>
      </div>
    </button>
  );
}

function FeatureRow({ text }: { text: string }) {
  return (
    <div
      className="flex items-center gap-2.5"
      style={{
        padding: "10px 14px",
        borderRadius: 12,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div
        className="flex shrink-0 items-center justify-center"
        style={{
          width: 22,
          height: 22,
          borderRadius: 7,
          background: "rgba(52,211,153,0.16)",
        }}
      >
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none">
          <path
            d="M5 12.5l4.5 4.5L19 7.5"
            stroke="#34D399"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span
        style={{
          fontSize: 14,
          color: "rgba(255,255,255,0.9)",
        }}
      >
        {text}
      </span>
    </div>
  );
}
