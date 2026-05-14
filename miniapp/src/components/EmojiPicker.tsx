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
      {PRESET.map((e) => (
        <button
          key={e}
          type="button"
          onClick={() => onChange(e)}
          className={`aspect-square rounded-lg text-2xl transition ${
            value === e
              ? "bg-brand-500 text-white"
              : "bg-tg-secondary-bg hover:bg-tg-secondary-bg/70"
          }`}
        >
          {e}
        </button>
      ))}
    </div>
  );
}
