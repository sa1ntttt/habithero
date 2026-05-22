type Props = {
  n: number;
};

export function FireChip({ n }: Props) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        padding: "1px 7px 1px 5px",
        borderRadius: 999,
        background: "rgba(251,146,60,0.10)",
        border: "1px solid rgba(251,146,60,0.18)",
        fontSize: 10.5,
        fontWeight: 600,
        color: "#FDBA74",
        letterSpacing: "-0.01em",
      }}
    >
      <svg width="9" height="10" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 3.5c.8 2.4 3.5 3.8 3.5 7.5a3.5 3.5 0 0 1-7 0c0-1.2.5-2 1.2-2.5 0 1.3.5 1.8 1 1.8-.2-1.8-.8-3 1.3-6.8Z"
          stroke="#FB923C"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
      {n}
    </span>
  );
}
