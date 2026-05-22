type Props = {
  onClick?: () => void;
  disabled?: boolean;
};

export function PlusButton({ onClick, disabled = false }: Props) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      disabled={disabled}
      aria-label="Добавить"
      style={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "0",
        background: disabled ? "rgba(255,255,255,0.06)" : "#3B82F6",
        boxShadow: disabled
          ? "none"
          : "0 2px 6px -1px rgba(59,130,246,0.40)",
        cursor: disabled ? "default" : "pointer",
        flexShrink: 0,
        opacity: disabled ? 0.5 : 1,
        transition: "all 150ms ease",
      }}
    >
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
        <path
          d="M12 5v14M5 12h14"
          stroke="white"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}
