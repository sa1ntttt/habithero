type Props = {
  done: boolean;
  onClick?: () => void;
  disabled?: boolean;
};

export function CheckCircle({ done, onClick, disabled = false }: Props) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      disabled={disabled}
      aria-label={done ? "Сделано" : "Отметить выполненным"}
      style={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: done ? "0" : "1.6px solid rgba(255,255,255,0.18)",
        background: done ? "#10B981" : "transparent",
        boxShadow: done ? "0 2px 6px -1px rgba(16,185,129,0.35)" : "none",
        cursor: disabled ? "default" : "pointer",
        flexShrink: 0,
        opacity: disabled ? 0.5 : 1,
        transition: "all 200ms ease",
      }}
    >
      {done && (
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <path
            d="M5 12.5l4.5 4.5L19 7.5"
            stroke="white"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
