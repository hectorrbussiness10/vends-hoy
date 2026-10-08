import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}", "./config/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "var(--ink, #14110F)",
        cream: "var(--cream, #F7F2EB)",
        sand: "var(--sand, #E6D8C8)",
        terracotta: "var(--terracotta, #9C3B2E)",
        gold: "var(--gold, #C6A15B)",
        olive: "var(--olive, #3E463C)",
        foam: "var(--foam, #EFE6DA)",
        night: "#0B0C10",
        steel: "#1B1F2A",
        paper: "var(--paper, #F4F0EA)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 18px 50px -28px rgba(20, 17, 15, 0.45)",
        screen: "0 40px 80px -20px rgba(0,0,0,0.55)",
      },
    },
  },
  plugins: [],
};

export default config;
