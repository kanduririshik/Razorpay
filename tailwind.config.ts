import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#090d16",
        surface: {
          50: "#131b2e",
          100: "#0f172a",
          200: "#1e293b",
          300: "#334155",
        },
        border: "#1e293b",
        brand: {
          50: "#f0f7ff",
          100: "#e0effe",
          500: "#0284c7",
          600: "#0369a1",
          blue: "#0c2340",
          accent: "#2563eb",
          electric: "#38bdf8",
        },
        ai: {
          50: "#f5f3ff",
          500: "#8b5cf6",
          600: "#7c3aed",
          glow: "#a855f7",
        },
        success: {
          DEFAULT: "#10b981",
          50: "#ecfdf5",
          500: "#10b981",
          600: "#059669",
        },
        warning: {
          DEFAULT: "#f59e0b",
          50: "#fffbeb",
          500: "#f59e0b",
        },
        danger: {
          DEFAULT: "#ef4444",
          50: "#fef2f2",
          500: "#ef4444",
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "ping-slow": "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
        "fade-in": "fadeIn 0.3s ease-out forwards",
        "slide-up": "slideUp 0.4s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      }
    },
  },
  plugins: [],
};

export default config;
