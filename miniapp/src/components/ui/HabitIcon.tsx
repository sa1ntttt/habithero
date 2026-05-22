import { Glyph, glyphFor } from "./Glyph";

type Props = {
  emoji: string;
  /** Optional user-picked color (overrides glyph default tone if set). */
  color?: string | null;
  size?: number;
};

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = hex.replace("#", "").match(/^([0-9a-fA-F]{6})$/);
  if (!m) return null;
  const v = parseInt(m[1], 16);
  return { r: (v >> 16) & 0xff, g: (v >> 8) & 0xff, b: v & 0xff };
}

function tintFromColor(color: string, alpha = 0.14): string {
  const rgb = hexToRgb(color);
  if (!rgb) return `rgba(139, 92, 246, ${alpha})`;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

export function HabitIcon({ emoji, color, size = 44 }: Props) {
  const radius = Math.round(size * 0.3);
  const glyph = glyphFor(emoji);

  // Resolve accent color: user-picked color > glyph's default tone > brand purple.
  const accent =
    color && /^#[0-9a-fA-F]{6}$/.test(color)
      ? color
      : glyph?.color || "#8B5CF6";

  const tint = tintFromColor(accent);

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
        color: accent,
      }}
    >
      {glyph ? (
        <Glyph
          name={glyph.name}
          size={Math.round(size * 0.55)}
          color={accent}
          strokeWidth={1.9}
        />
      ) : (
        <span style={{ fontSize: Math.round(size * 0.5), lineHeight: 1 }}>
          {emoji || "✨"}
        </span>
      )}
    </div>
  );
}
