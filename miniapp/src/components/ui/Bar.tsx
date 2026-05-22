type Props = {
  pct: number;
  gradient?: string;
  height?: number;
  track?: string;
};

export function Bar({
  pct,
  gradient = "linear-gradient(90deg, #A78BFA, #6366F1)",
  height = 6,
  track = "rgba(255,255,255,0.10)",
}: Props) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div
      style={{
        width: "100%",
        height,
        background: track,
        borderRadius: 999,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${clamped}%`,
          height: "100%",
          background: gradient,
          borderRadius: 999,
          transition: "width 600ms cubic-bezier(.2,.8,.2,1)",
        }}
      />
    </div>
  );
}
