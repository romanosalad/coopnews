import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0A0A0A",
        "ink-soft": "#1A1A1A",
        paper: "#FAFAF7",
        brand: "#C7F542",
        "brand-2": "#9AD13E",
        accent: "#FF5A36",
        mute: "#5C5C58",
        "mute-2": "#8C8C88"
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Times New Roman", "serif"],
        sans: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
        mono: ["var(--font-space-mono)", "ui-monospace", "monospace"]
      }
    }
  },
  plugins: []
};

export default config;
