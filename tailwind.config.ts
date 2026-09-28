import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
          950: "#172554",
        },
        brand: {
          blue:  "#1D4ED8",
          light: "#3B82F6",
          fill:  "#EFF6FF",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in":         "fadeIn 0.25s ease-out both",
        "fade-in-up":      "fadeInUp 0.35s ease-out both",
        "fade-in-down":    "fadeInDown 0.25s ease-out both",
        "scale-in":        "scaleIn 0.25s cubic-bezier(0.34,1.56,0.64,1) both",
        "slide-up":        "slideUp 0.4s ease-out",
        "slide-in-left":   "slideInLeft 0.3s ease-out",
        "slide-in-right":  "slideInRight 0.3s ease-out both",
        "float":           "float 6s ease-in-out infinite",
        "pulse-slow":      "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
        "spin-slow":       "spin 8s linear infinite",
        "gradient":        "gradient 6s ease infinite",
        "glow":            "glow 2s ease-in-out infinite",
        "shake":           "shake 0.45s ease-in-out",
        "bounce-soft":     "bounceSoft 1.5s ease-in-out infinite",
        "pulse-glow":      "pulseGlow 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInDown: {
          "0%":   { opacity: "0", transform: "translateY(-12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%":   { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideUp: {
          "0%":   { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)",    opacity: "1" },
        },
        slideInLeft: {
          "0%":   { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)",     opacity: "1" },
        },
        slideInRight: {
          "0%":   { opacity: "0", transform: "translateX(24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-20px)" },
        },
        gradient: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%":      { backgroundPosition: "100% 50%" },
        },
        glow: {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.6" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%":      { transform: "translateX(-8px)" },
          "40%":      { transform: "translateX(8px)" },
          "60%":      { transform: "translateX(-6px)" },
          "80%":      { transform: "translateX(6px)" },
        },
        bounceSoft: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-4px)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(59,130,246,0.4)" },
          "50%":      { boxShadow: "0 0 0 12px rgba(59,130,246,0)" },
        },
      },
      backgroundSize: {
        "300%": "300%",
      },
      boxShadow: {
        "glow":    "0 0 20px rgba(29, 78, 216, 0.3)",
        "glow-lg": "0 0 40px rgba(29, 78, 216, 0.4)",
        "card":    "0 4px 24px rgba(0,0,0,0.08)",
        "card-hover": "0 8px 40px rgba(0,0,0,0.14)",
      },
    },
  },
  plugins: [],
};
export default config;
