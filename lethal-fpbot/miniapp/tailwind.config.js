/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f4f3ff",
          100: "#ebe9fe",
          500: "#7c5cff",
          600: "#6845e6",
          700: "#5333b3",
          900: "#27184f",
        },
        bg: {
          DEFAULT: "var(--tg-bg, #ffffff)",
          subtle: "var(--tg-secondary-bg, #f4f4f8)",
        },
        text: {
          DEFAULT: "var(--tg-text, #000000)",
          muted: "var(--tg-hint, #707579)",
        },
      },
      borderRadius: {
        xl: "16px",
        "2xl": "20px",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
