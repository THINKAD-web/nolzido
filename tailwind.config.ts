import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#F7F6F1",
        ink: "#1A1A1F",
        red: "#E8442E",
        cobalt: "#2438E8",
        line: "#DEDCD3",
        muted: "#8A887E",
        card: "#FFFFFF",
      },
      borderRadius: {
        card: "16px",
        pill: "999px",
      },
      fontFamily: {
        // --font-sans / --font-display are set in globals.css so the
        // underlying font can be swapped without touching this config.
        sans: ["var(--font-sans)", ...defaultTheme.fontFamily.sans],
        display: ["var(--font-display)", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
};

export default config;
