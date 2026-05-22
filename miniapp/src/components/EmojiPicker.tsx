const PRESET = [
  "✅", "💪", "📚", "🏃", "💧", "🧘", "🎯", "🌟",
  "🍎", "😴", "🚶", "🧠", "🎨", "✍️", "🎵", "💻",
  "💰", "🌅", "🌙", "🔥",
];

interface Props {
  value: string;
  onChange: (emoji: string) => void;
}

export function EmojiPicker({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-8 gap-2">
      {PRESET.map((e) => {
        const active = value === e;
        return (
          <button
            key={e}
            type="button"
            onClick={() => onChange(e)}
            className="flex aspect-square items-center justify-center transition"
            style={{
              fontSize: 22,
              borderRadius: 12,
              background: active
                ? "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)"
                : "#1A1A24",
              border: active
                ? "1px solid rgba(255,255,255,0.18)"
                : "1px solid rgba(255,255,255,0.05)",
              boxShadow: active
                ? "0 4px 12px -2px rgba(139,92,246,0.4)"
                : "none",
              cursor: "pointer",
            }}
          >
            {e}
          </button>
        );
      })}
    </div>
  );
}
