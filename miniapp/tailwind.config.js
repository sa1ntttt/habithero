/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Telegram theme variables — defaults set to dark so layout stays consistent
        // even outside Telegram or in light Telegram themes.
        tg: {
          bg: "var(--tg-bg-color, #0A0A0F)",
          text: "var(--tg-text-color, rgba(255,255,255,0.95))",
          hint: "var(--tg-hint-color, #71717A)",
          link: "var(--tg-link-color, #A78BFA)",
          button: "var(--tg-button-color, #8B5CF6)",
          "button-text": "var(--tg-button-text-color, #ffffff)",
          "secondary-bg": "var(--tg-secondary-bg-color, #1A1A24)",
        },

        // Dark-theme surfaces (from design mocks: home/app.jsx C tokens)
        ink: {
          bg: "#0A0A0F",
          surface: "#1A1A24",
          elevated: "#252535",
        },

        // Brand purple — extended scale. 400 is the hero gradient start,
        // 500 is the hero gradient end. 300 is the active-nav tint.
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          300: "#A78BFA",
          400: "#8B5CF6",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
        },

        // Tonal accents for habit icons & state chips
        tone: {
          fitness: "#F97316",
          water: "#38BDF8",
          reading: "#F59E0B",
          meditation: "#A78BFA",
          running: "#22D3EE",
          fire: "#FB923C",
          stats: "#22D3EE",
          trophy: "#FBBF24",
          success: "#34D399",
          done: "#10B981",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Display"',
          '"SF Pro Text"',
          "Inter",
          "system-ui",
          "Roboto",
          "sans-serif",
        ],
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
      },
      boxShadow: {
        card:
          "0 1px 0 rgba(255,255,255,0.06) inset, 0 4px 12px rgba(0,0,0,0.3)",
        hero:
          "0 1px 0 rgba(255,255,255,0.14) inset, 0 -1px 0 rgba(0,0,0,0.2) inset, 0 18px 36px -16px rgba(99,102,241,0.40)",
      },
      borderColor: {
        line: "rgba(255,255,255,0.08)",
        "line-hi": "rgba(255,255,255,0.14)",
      },
    },
  },
  plugins: [],
};
