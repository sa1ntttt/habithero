import type { ReactElement } from "react";

// Flat 2D Lucide-style glyphs.
// Single-color stroke, 24x24 viewBox, stroke-width 1.8, round caps/joins.

export type GlyphName =
  | "check"
  | "plus"
  | "dumbbell"
  | "book"
  | "run"
  | "droplet"
  | "lotus"
  | "target"
  | "star"
  | "apple"
  | "moon"
  | "walking"
  | "brain"
  | "palette"
  | "pen"
  | "music"
  | "laptop"
  | "coin"
  | "sunrise"
  | "flame"
  | "sprout"
  | "sparkles"
  | "calendar"
  | "trophy"
  | "gem"
  | "medal"
  | "crown"
  | "rocket"
  | "bars"
  | "leaf"
  | "gift"
  | "heart"
  | "handshake"
  | "shield";

const PATHS: Record<GlyphName, ReactElement> = {
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  plus: <path d="M12 5v14M5 12h14" />,

  dumbbell: (
    <>
      <path d="M3 10v4M5.5 8.5v7M18.5 8.5v7M21 10v4M8 12h8" />
    </>
  ),

  book: (
    <>
      <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5V4.5z" />
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    </>
  ),

  run: (
    <>
      <circle cx="17" cy="4.5" r="2" />
      <path d="M15.5 9.5l-3 2-2 4 3 2 2 5" />
      <path d="M5 13l3-2 3 1" />
      <path d="M9.5 18l-3 4" />
    </>
  ),

  droplet: (
    <path d="M12 2.5s6.5 6 6.5 11a6.5 6.5 0 1 1-13 0c0-5 6.5-11 6.5-11z" />
  ),

  lotus: (
    <>
      <path d="M12 3v4" />
      <path d="M12 21c-4 0-8-2-8-6 2 0 4 1 5 2" />
      <path d="M12 21c4 0 8-2 8-6-2 0-4 1-5 2" />
      <path d="M12 21c-3 0-5-3-5-7 0-2 2-4 5-7 3 3 5 5 5 7 0 4-2 7-5 7z" />
    </>
  ),

  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </>
  ),

  star: (
    <path d="M12 3l2.6 6.4 6.9.6-5.2 4.5 1.6 6.8L12 18.2 6.1 21.3l1.6-6.8L2.5 10l6.9-.6L12 3Z" />
  ),

  apple: (
    <>
      <path d="M12 8c-1-2-3-3-5-2.5C5 6 4 8 4 11c0 5 3.5 10 8 10s8-5 8-10c0-3-1-5-3-5.5-2-.5-4 .5-5 2.5Z" />
      <path d="M12 8c0-1.5.5-3 2.5-4" />
    </>
  ),

  moon: (
    <path d="M20.5 14a8.5 8.5 0 1 1-10.5-11 7 7 0 0 0 10.5 11z" />
  ),

  walking: (
    <>
      <circle cx="13" cy="4" r="2" />
      <path d="M13 7l-2 5 2 3v6" />
      <path d="M13 12l4 3" />
      <path d="M11 12l-3 4" />
    </>
  ),

  brain: (
    <>
      <path d="M12 5a3 3 0 0 0-5 1.5A3 3 0 0 0 4 10c0 1 .5 2 1.5 2.5C5 13 4.5 14 5 15s2 1.5 3 1.5c0 1.5 1 3 2 3 1.5 0 2-1.5 2-2.5" />
      <path d="M12 5a3 3 0 0 1 5 1.5A3 3 0 0 1 20 10c0 1-.5 2-1.5 2.5.5.5 1 1.5.5 2.5s-2 1.5-3 1.5c0 1.5-1 3-2 3-1.5 0-2-1.5-2-2.5" />
      <path d="M12 5v14" />
    </>
  ),

  palette: (
    <>
      <path d="M12 3a9 9 0 0 0 0 18c1.5 0 2-1 2-2 0-1.5 1-2.5 2.5-2.5H18c2 0 3-1.5 3-3.5 0-5-4-10-9-10Z" />
      <circle cx="7.5" cy="11" r="1" fill="currentColor" stroke="none" />
      <circle cx="11" cy="7.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="9" r="1" fill="currentColor" stroke="none" />
    </>
  ),

  pen: (
    <>
      <path d="M14.5 4.5l5 5L9 20H4v-5l10.5-10.5z" />
      <path d="M13 6l5 5" />
    </>
  ),

  music: (
    <>
      <path d="M9 18V6l10-3v12" />
      <circle cx="6.5" cy="18" r="2.5" />
      <circle cx="16.5" cy="15" r="2.5" />
    </>
  ),

  laptop: (
    <>
      <rect x="4" y="5" width="16" height="11" rx="1.5" />
      <path d="M2 19h20" />
    </>
  ),

  coin: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5h4a2 2 0 0 1 0 4H10.5a2 2 0 0 0 0 4h4.5M12 6.5v1M12 16.5v1" />
    </>
  ),

  sunrise: (
    <>
      <path d="M3 19h18" />
      <path d="M6 19a6 6 0 0 1 12 0" />
      <path d="M12 4v4" />
      <path d="M4.5 11l2 2M19.5 11l-2 2" />
    </>
  ),

  flame: (
    <path d="M12 3.5c.8 2.4 3.5 3.8 3.5 7.5a3.5 3.5 0 0 1-7 0c0-1.2.5-2 1.2-2.5 0 1.3.5 1.8 1 1.8-.2-1.8-.8-3 1.3-6.8Z" />
  ),

  sprout: (
    <>
      <path d="M12 20v-8" />
      <path d="M12 12c-3.5 0-6-2-6-5.5 3.5 0 6 2 6 5.5Z" />
      <path d="M12 12c3.5 0 6-2 6-5.5-3.5 0-6 2-6 5.5Z" />
      <path d="M5 20h14" />
    </>
  ),

  sparkles: (
    <>
      <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" />
      <path d="M19 15l.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8L19 15Z" />
      <path d="M5 16l.6 1.4 1.4.6-1.4.6L5 20l-.6-1.4L3 18l1.4-.6L5 16Z" />
    </>
  ),

  calendar: (
    <>
      <rect x="4" y="5" width="16" height="16" rx="2" />
      <path d="M4 9h16M9 3v4M15 3v4" />
      <circle cx="9" cy="14" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="12" cy="14" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="15" cy="14" r="0.6" fill="currentColor" stroke="none" />
    </>
  ),

  trophy: (
    <>
      <path d="M8 4h8v4.5a4 4 0 0 1-8 0V4Z" />
      <path d="M8 6H5.5a2 2 0 0 0 2.5 3M16 6h2.5a2 2 0 0 1-2.5 3" />
      <path d="M12 12.5v3.5M9.5 19.5h5M10.5 17h3" />
    </>
  ),

  gem: (
    <>
      <path d="M5.5 9l3-4h7l3 4-6.5 12L5.5 9Z" />
      <path d="M5.5 9h13" />
      <path d="M9 9l3-4M15 9l-3-4" />
    </>
  ),

  medal: (
    <>
      <path d="M7 3l3 6M17 3l-3 6M7 3H4l3 7M17 3h3l-3 7" />
      <circle cx="12" cy="15" r="5.5" />
      <path d="M12 13v3" strokeWidth="1.5" />
    </>
  ),

  crown: (
    <>
      <path d="M3 8l3 10h12l3-10-5 3-4-6-4 6-5-3Z" />
      <path d="M3 20h18" />
    </>
  ),

  rocket: (
    <>
      <path d="M14 4l6 6-9 9-5-5 8-10Z" />
      <path d="M9 13l-4 4 4 4 4-4" />
      <circle cx="15" cy="9" r="1.2" />
    </>
  ),

  bars: <path d="M5 19v-5M12 19v-9M19 19v-13" />,

  leaf: (
    <>
      <path d="M3.5 20.5c2-9 8-15 17-17-1 9-7 16-17 17z" />
      <path d="M3.5 20.5l9-9" />
    </>
  ),

  gift: (
    <>
      <path d="M3 9h18v4H3z" />
      <path d="M5 13h14v8H5z" />
      <path d="M12 9v12" />
      <path d="M12 9c-2-3-7-2-6 .5C7 11 10 10 12 9Z" />
      <path d="M12 9c2-3 7-2 6 .5C17 11 14 10 12 9Z" />
    </>
  ),

  heart: (
    <path d="M12 20s-7-4-7-10c0-3 2-5 4-5 1.5 0 2.5 1 3 2 .5-1 1.5-2 3-2 2 0 4 2 4 5 0 6-7 10-7 10z" />
  ),

  handshake: (
    <>
      <path d="M5 14l3 3 2-2 3 3 4-4-3-3-2 2-3-3-4 4Z" />
      <path d="M2 12l3-3M22 12l-3-3" />
    </>
  ),

  shield: (
    <>
      <path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6l8-3Z" />
      <path d="M9 12.5l2.5 2.5L15 11" />
    </>
  ),
};

interface GlyphProps {
  name: GlyphName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function Glyph({
  name,
  size = 22,
  color = "currentColor",
  strokeWidth = 1.8,
}: GlyphProps) {
  const inner = PATHS[name];
  if (!inner) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {inner}
    </svg>
  );
}

// ─── Emoji → glyph mapping with default tone color ───────────────
export type GlyphTone = { name: GlyphName; color: string };

const EMOJI_GLYPHS: Record<string, GlyphTone> = {
  // EmojiPicker preset (habit emojis)
  "✅": { name: "check", color: "#34D399" },
  "💪": { name: "dumbbell", color: "#FB923C" },
  "📚": { name: "book", color: "#F59E0B" },
  "🏃": { name: "run", color: "#22D3EE" },
  "💧": { name: "droplet", color: "#38BDF8" },
  "🧘": { name: "lotus", color: "#A78BFA" },
  "🎯": { name: "target", color: "#F87171" },
  "🌟": { name: "star", color: "#FBBF24" },
  "🍎": { name: "apple", color: "#F87171" },
  "😴": { name: "moon", color: "#818CF8" },
  "🚶": { name: "walking", color: "#34D399" },
  "🧠": { name: "brain", color: "#F472B6" },
  "🎨": { name: "palette", color: "#F472B6" },
  "✍": { name: "pen", color: "#F59E0B" },
  "🎵": { name: "music", color: "#A78BFA" },
  "💻": { name: "laptop", color: "#22D3EE" },
  "💰": { name: "coin", color: "#FBBF24" },
  "🌅": { name: "sunrise", color: "#F97316" },
  "🌙": { name: "moon", color: "#818CF8" },
  "🔥": { name: "flame", color: "#FB923C" },

  // Common achievement emojis
  "🌱": { name: "sprout", color: "#34D399" },
  "✨": { name: "sparkles", color: "#A78BFA" },
  "📅": { name: "calendar", color: "#22D3EE" },
  "🏆": { name: "trophy", color: "#FBBF24" },
  "⭐": { name: "star", color: "#FBBF24" },
  "💎": { name: "gem", color: "#22D3EE" },
  "🎖": { name: "medal", color: "#FBBF24" },
  "🏅": { name: "medal", color: "#FBBF24" },
  "👑": { name: "crown", color: "#FBBF24" },
  "🥇": { name: "medal", color: "#FBBF24" },
  "🥈": { name: "medal", color: "#A1A1AA" },
  "🥉": { name: "medal", color: "#CD7F32" },
  "🚀": { name: "rocket", color: "#A78BFA" },
  "📊": { name: "bars", color: "#22D3EE" },
  "🍃": { name: "leaf", color: "#34D399" },
  "🎁": { name: "gift", color: "#F472B6" },
  "❤": { name: "heart", color: "#F87171" },
  "🤝": { name: "handshake", color: "#A78BFA" },
  "🛡": { name: "shield", color: "#A78BFA" },
};

function normalize(emoji: string): string {
  // Strip variation selector U+FE0F so "✍️" and "✍" both match.
  return emoji.replace(/️/g, "").trim();
}

export function glyphFor(emoji: string | null | undefined): GlyphTone | null {
  if (!emoji) return null;
  return EMOJI_GLYPHS[normalize(emoji)] ?? null;
}
