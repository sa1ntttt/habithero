import { useTelegram } from "../../hooks/useTelegram";

type Props = {
  title?: string;
  subtitle?: string;
};

function ChevLeft() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path
        d="M15 6l-6 6 6 6"
        stroke="#A78BFA"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MiniAppHeader({
  title = "HabitHero",
  subtitle = "мини-приложение",
}: Props) {
  const { tg } = useTelegram();

  return (
    <div
      className="flex items-center justify-between border-b border-line"
      style={{
        padding: "8px 16px 10px",
        height: 44,
        background: "rgba(10,10,15,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <button
        onClick={() => tg?.HapticFeedback?.impactOccurred?.("light")}
        className="flex items-center gap-0.5 bg-transparent border-0 p-0 cursor-pointer"
        style={{ color: "#A78BFA", fontSize: 15, fontWeight: 400 }}
      >
        <ChevLeft />
        <span style={{ marginLeft: -2 }}>Чаты</span>
      </button>

      <div className="text-center" style={{ lineHeight: 1.1 }}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: "rgba(255,255,255,0.95)",
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 11, color: "#71717A", marginTop: 1 }}>
          {subtitle}
        </div>
      </div>

      <button
        onClick={() => tg?.close?.()}
        className="flex items-center gap-1.5 bg-transparent border-0 p-0 cursor-pointer"
        style={{ color: "#A1A1AA", fontSize: 15 }}
      >
        <span>Закрыть</span>
      </button>
    </div>
  );
}
