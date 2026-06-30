import type { Config } from "tailwindcss";

// Tokens mirror the ported design system in app/globals.css (:root).
// Utilities reference the same CSS variables so Tailwind and the global CSS never drift.
const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        primary: "var(--primary)",
        "primary-soft": "var(--primary-soft)",
        "primary-hover": "var(--primary-hover)",
        blue: "var(--blue)",
        green: "var(--green)",
        amber: "var(--amber)",
        ink: "var(--text)",
        muted: "var(--text-soft)",
        faint: "var(--text-faint)",
        line: "var(--line)",
      },
      fontFamily: {
        sans: [
          "var(--font-rubik)",
          "var(--font-cairo)",
          "Rubik",
          "Cairo",
          "system-ui",
          "sans-serif",
        ],
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        DEFAULT: "var(--radius)",
        sm: "var(--radius-sm)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        DEFAULT: "var(--shadow)",
        lg: "var(--shadow-lg)",
      },
    },
  },
  plugins: [],
};

export default config;
