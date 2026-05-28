import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        /* Shadcn semantic tokens */
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        popover: "hsl(var(--popover))",
        "popover-foreground": "hsl(var(--popover-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        secondary: "hsl(var(--secondary))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        destructive: "hsl(var(--destructive))",
        "destructive-foreground": "hsl(var(--destructive-foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        /* DESIGN.md Surfaces */
        "surface-deep": "#000000",
        "surface-subtle": "#060606",
        "surface-card": "#1f1f1f",
        "surface-border": "#252525",
        "surface-elevated": "#313131",

        /* DESIGN.md Text colors */
        "text-outlined": "#c5c5c5",
        "text-muted": "#7a7a7a",
        "text-faint": "#3d3d3d",

        /* DESIGN.md Accents (emerald replacing lime) */
        "accent-brand": "#10b981",
      },
      fontFamily: {
        sans: ["var(--font-inter-tight)", "Inter", "system-ui", "sans-serif"],
        serif: ["var(--font-pt-serif)", "Source Serif 4", "serif"],
        mono: ["var(--font-jetbrains-mono)", "Fira Code", "monospace"],
        "ui-mono": ["ui-monospace", "SF Mono", "monospace"],
      },
      fontSize: {
        body: ["14px", { lineHeight: "1.55", letterSpacing: "0.03px" }],
        subheading: ["20px", { lineHeight: "1.2", letterSpacing: "0.01px" }],
        heading: ["49px", { lineHeight: "1.05", letterSpacing: "-0.01px" }],
        "heading-lg": ["72px", { lineHeight: "1", letterSpacing: "-0.02px" }],
        display: ["130px", { lineHeight: "0.88", letterSpacing: "-0.035px" }],
      },
      spacing: {
        "6": "6px",
        "7": "7px",
        "10": "10px",
        "14": "14px",
        "18": "18px",
        "22": "22px",
        "30": "30px",
      },
      boxShadow: {
        sm: "rgba(16, 185, 129, 0.45) 0px 0px 8px 0px",
      },
      animation: {
        "fade-in": "fadeIn 300ms ease-out",
        "slide-up": "slideUp 300ms ease-out",
        "scale-in": "scaleIn 200ms ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
