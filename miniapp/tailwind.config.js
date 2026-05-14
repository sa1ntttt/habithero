/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Telegram theme variables (filled by Telegram on load; safe defaults below)
        tg: {
          bg: "var(--tg-bg-color, #ffffff)",
          text: "var(--tg-text-color, #000000)",
          hint: "var(--tg-hint-color, #999999)",
          link: "var(--tg-link-color, #2481cc)",
          button: "var(--tg-button-color, #2481cc)",
          "button-text": "var(--tg-button-text-color, #ffffff)",
          "secondary-bg": "var(--tg-secondary-bg-color, #f4f4f5)",
        },
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
        },
      },
    },
  },
  plugins: [],
};
