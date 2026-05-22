import { useNavigate } from "react-router-dom";
import type { AccessOut } from "../../types/api";

interface Props {
  access: AccessOut | null;
}

/** Shown above Dashboard when trial has ≤ 5 days left. Lifetime/paid users see nothing. */
export function TrialBanner({ access }: Props) {
  if (!access || access.status !== "trial") return null;
  const days = access.days_left ?? 0;
  if (days > 5) return null;

  const navigate = useNavigate();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate("/profile")}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") navigate("/profile");
      }}
      className="flex items-center gap-3 cursor-pointer outline-none"
      style={{
        padding: "12px 14px",
        borderRadius: 14,
        background:
          "linear-gradient(135deg, rgba(251,191,36,0.16), rgba(245,158,11,0.08))",
        border: "1px solid rgba(251,191,36,0.28)",
      }}
    >
      <div
        className="flex shrink-0 items-center justify-center"
        style={{
          width: 36,
          height: 36,
          borderRadius: 11,
          background: "rgba(251,191,36,0.20)",
        }}
      >
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="#FBBF24" strokeWidth="1.8" />
          <path
            d="M12 8v4l3 2"
            stroke="#FBBF24"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div
          style={{
            fontSize: 13.5,
            fontWeight: 600,
            color: "rgba(255,255,255,0.95)",
            lineHeight: 1.2,
          }}
        >
          Осталось {days}{" "}
          {days === 1 ? "день" : days < 5 ? "дня" : "дней"} пробного периода
        </div>
        <div
          style={{
            fontSize: 12,
            color: "#A1A1AA",
            marginTop: 2,
          }}
        >
          Оформить подписку
        </div>
      </div>
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
        <path
          d="M9 6l6 6-6 6"
          stroke="#FBBF24"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
