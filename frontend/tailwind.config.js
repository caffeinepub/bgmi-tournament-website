/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Exo 2', 'sans-serif'],
        heading: ['Rajdhani', 'sans-serif'],
      },
      colors: {
        background: "oklch(var(--background) / <alpha-value>)",
        foreground: "oklch(var(--foreground) / <alpha-value>)",
        card: {
          DEFAULT: "oklch(var(--card) / <alpha-value>)",
          foreground: "oklch(var(--card-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "oklch(var(--popover) / <alpha-value>)",
          foreground: "oklch(var(--popover-foreground) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "oklch(var(--primary) / <alpha-value>)",
          foreground: "oklch(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "oklch(var(--secondary) / <alpha-value>)",
          foreground: "oklch(var(--secondary-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "oklch(var(--muted) / <alpha-value>)",
          foreground: "oklch(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "oklch(var(--accent) / <alpha-value>)",
          foreground: "oklch(var(--accent-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "oklch(var(--destructive) / <alpha-value>)",
          foreground: "oklch(var(--destructive-foreground) / <alpha-value>)",
        },
        border: "oklch(var(--border) / <alpha-value>)",
        input: "oklch(var(--input) / <alpha-value>)",
        ring: "oklch(var(--ring) / <alpha-value>)",
        success: {
          DEFAULT: "oklch(var(--success) / <alpha-value>)",
          foreground: "oklch(var(--success-foreground) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "oklch(var(--warning) / <alpha-value>)",
          foreground: "oklch(var(--warning-foreground) / <alpha-value>)",
        },
        brand: {
          red: "oklch(0.48 0.24 22)",
          orange: "oklch(0.65 0.22 52)",
          crimson: "oklch(0.42 0.24 18)",
          amber: "oklch(0.68 0.20 55)",
          coral: "oklch(0.62 0.22 32)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, oklch(0.48 0.24 22), oklch(0.65 0.22 52))',
        'brand-gradient-dark': 'linear-gradient(135deg, oklch(0.42 0.24 18), oklch(0.58 0.22 48))',
        'brand-gradient-h': 'linear-gradient(90deg, oklch(0.48 0.24 22), oklch(0.65 0.22 52))',
        'brand-gradient-v': 'linear-gradient(180deg, oklch(0.48 0.24 22), oklch(0.65 0.22 52))',
      },
      boxShadow: {
        'brand': '0 4px 24px oklch(0.48 0.24 22 / 0.3)',
        'brand-lg': '0 8px 40px oklch(0.48 0.24 22 / 0.4)',
        'brand-sm': '0 2px 12px oklch(0.48 0.24 22 / 0.2)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-brand": {
          "0%, 100%": { boxShadow: "0 0 0 0 oklch(0.48 0.24 22 / 0.4)" },
          "50%": { boxShadow: "0 0 0 8px oklch(0.48 0.24 22 / 0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-brand": "pulse-brand 2s infinite",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
  ],
}
