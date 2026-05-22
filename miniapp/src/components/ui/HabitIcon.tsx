type Props = {
  emoji: string;
  color?: string | null;
  size?: number;
};

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = hex.replace("#", "").match(/^([0-9a-fA-F]{6})$/);
  if (!m) return null;
  const v = parseInt(m[1], 16);
  return { r: (v >> 16) & 0xff, g: (v >> 8) & 0xff, b: v & 0xff };
}

export function HabitIcon({ emoji, color, size = 44 }: Props) {
  const radius = Math.round(size * 0.3);
  const rgb = color ? hexToRgb(color) : null;
  const tint = rgb
    ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.14)`
    : "rgba(139, 92, 246, 0.14)";

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        flexShrink: 0,
        background: tint,
        border: "1px solid rgba(255,255,255,0.05)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: Math.round(size * 0.5),
        lineHeight: 1,
      }}
    >
      {emoji || "✨"}
    </div>
  );
}
