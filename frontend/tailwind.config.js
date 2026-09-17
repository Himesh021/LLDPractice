/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "ui-monospace", "monospace"],
      },
      boxShadow: {
        focus: "0 0 0 3px rgba(59, 130, 246, 0.18)",
        soft: "0 8px 24px rgba(15, 23, 42, 0.12)",
      },
      colors: {
        ink: {
          950: "#0b1020",
          900: "#121a2a",
          700: "#dfe7ff",
          500: "#8da0bd",
          400: "#7284a3",
          200: "#2b3442",
          100: "#1a2333",
          50: "#0f1729",
        },
        accent: {
          700: "#3b82f6",
          600: "#60a5fa",
          500: "#93c5fd",
          100: "#dbeafe",
          50: "#eff6ff",
        },
      },
      transitionDuration: {
        DEFAULT: "180ms",
      },
    },
  },
  plugins: [],
};
