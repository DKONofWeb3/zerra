/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Surfaces
        bg: {
          base: "rgb(var(--bg-base) / <alpha-value>)",
          sidebar: "rgb(var(--bg-sidebar) / <alpha-value>)",
          card: "rgb(var(--bg-card) / <alpha-value>)",
          elevated: "rgb(var(--bg-elevated) / <alpha-value>)",
        },
        // Text
        fg: {
          primary: "rgb(var(--fg-primary) / <alpha-value>)",
          secondary: "rgb(var(--fg-secondary) / <alpha-value>)",
          tertiary: "rgb(var(--fg-tertiary) / <alpha-value>)",
          muted: "rgb(var(--fg-muted) / <alpha-value>)",
        },
        // Strokes
        stroke: {
          DEFAULT: "rgb(var(--stroke) / <alpha-value>)",
          strong: "rgb(var(--stroke-strong) / <alpha-value>)",
        },
        // Brand & state
        brand: {
          DEFAULT: "rgb(var(--brand) / <alpha-value>)",
          glow: "rgb(var(--brand-glow) / <alpha-value>)",
        },
        success: "rgb(var(--success) / <alpha-value>)",
        danger: "rgb(var(--danger) / <alpha-value>)",
        warning: "rgb(var(--warning) / <alpha-value>)",
        streak: "rgb(var(--streak) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["Satoshi", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Satoshi", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      fontSize: {
        // Custom scale to match design
        "display-xl": ["3.5rem", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "display-lg": ["2.75rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-md": ["2rem", { lineHeight: "1.15", letterSpacing: "-0.015em" }],
        "label-xs": ["0.6875rem", { lineHeight: "1", letterSpacing: "0.08em" }],
      },
      borderRadius: {
        card: "1.25rem",
        pill: "9999px",
      },
      boxShadow: {
        card: "0 1px 0 0 rgb(255 255 255 / 0.04) inset, 0 24px 48px -16px rgb(0 0 0 / 0.5)",
        "glow-brand": "0 0 24px rgb(var(--brand-glow) / 0.4)",
        "glow-success": "0 0 32px rgb(var(--success) / 0.25)",
        "glow-danger": "0 0 32px rgb(var(--danger) / 0.25)",
      },
      backgroundImage: {
        "card-gradient":
          "linear-gradient(180deg, rgb(255 255 255 / 0.03) 0%, rgb(255 255 255 / 0.01) 100%)",
        "sidebar-glow":
          "radial-gradient(900px 600px at 0% 0%, rgb(74 125 255 / 0.18), transparent 60%)",
      },
      animation: {
        "marquee": "marquee 40s linear infinite",
        "blink": "blink 1.1s steps(2, start) infinite",
        "shimmer": "shimmer 1.6s ease-in-out infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        flyoutIn: {
          "0%": { opacity: "0", transform: "translateX(-8px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
