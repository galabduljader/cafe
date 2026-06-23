import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        script: ["var(--font-script)", "cursive"],
      },
      colors: {
        // warm clay / camel — primary accent + readable text
        blush: {
          50: "#faf4ec",
          100: "#f3e8d8",
          200: "#e7d4ba",
          300: "#d8bd99",
          400: "#c5a37c",
          500: "#b08a5f",
          600: "#8a6a48",
          700: "#5f4a37",
        },
        // soft stone / greige — gentle cool-neutral differentiation
        lavender: {
          100: "#eee8df",
          200: "#ddd3c5",
          300: "#c5b6a3",
          400: "#a89483",
          500: "#85725f",
        },
        // champagne / honey gold
        gold: {
          200: "#f1e6c8",
          300: "#e7d4a4",
          400: "#d8bd7e",
          500: "#c0a056",
          600: "#9a7d3c",
        },
        // creamy paper surfaces
        parchment: {
          50: "#fdfbf6",
          100: "#f8f1e3",
          200: "#ece0cb",
        },
      },
      boxShadow: {
        paper:
          "0 1px 2px rgba(120, 95, 60, 0.08), 0 12px 28px -12px rgba(120, 95, 60, 0.26)",
        "paper-lg":
          "0 2px 4px rgba(120, 95, 60, 0.10), 0 28px 56px -20px rgba(120, 95, 60, 0.36)",
        glow: "0 0 0 1px rgba(192,160,86,0.35), 0 0 24px -4px rgba(176,138,95,0.40)",
      },
      keyframes: {
        floatUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        twinkle: {
          "0%, 100%": { opacity: "0.3", transform: "scale(0.85)" },
          "50%": { opacity: "1", transform: "scale(1.1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% center" },
          "100%": { backgroundPosition: "-200% center" },
        },
      },
      animation: {
        floatUp: "floatUp 0.5s ease-out both",
        twinkle: "twinkle 3s ease-in-out infinite",
        shimmer: "shimmer 6s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
