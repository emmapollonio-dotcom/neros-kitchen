import type { Config } from "tailwindcss";

// Design system N'sK — Luxury Minimalist
// Riferimento di qualità: Apple (whitespace, gerarchia tipografica sicura,
// micro-interazioni morbide) + Airbnb (card generose, angoli arrotondati,
// ombre soft, layout a griglia respirabile).
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        charcoal: "#121212",
        ink: "#1C1B19",
        ivory: "#F5F1EA",
        cream: "#FAF8F4",
        gold: "#C8A96B",
        "gold-dark": "#A8863F",
        smoke: "#555555",
        mist: "#8A8580",
        line: "#E7E1D6",
        // Guscio scuro (nav, sfondo pagina, header di sezione): il testo
        // secondario qui usa questi due, non smoke/mist (pensati per testo
        // scuro su card bianche, illeggibili su charcoal). "haze" fa da
        // bordo/divider sul fondo scuro.
        haze: "rgba(245, 241, 234, 0.12)",
      },
      fontFamily: {
        // Caricati via next/font/google in app/layout.tsx come CSS variable —
        // niente <link> esterni, niente layout shift.
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["4.5rem", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "display-lg": ["3.25rem", { lineHeight: "1.08", letterSpacing: "-0.015em" }],
        "display-md": ["2.25rem", { lineHeight: "1.15", letterSpacing: "-0.01em" }],
      },
      borderRadius: {
        nsk: "8px",
        card: "20px",
        panel: "28px",
        pill: "999px",
      },
      boxShadow: {
        soft: "0 2px 10px rgba(18, 18, 18, 0.05)",
        card: "0 8px 30px rgba(18, 18, 18, 0.07)",
        elevated: "0 20px 60px rgba(18, 18, 18, 0.12)",
      },
      transitionTimingFunction: {
        nsk: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      maxWidth: {
        content: "1200px",
      },
    },
  },
  plugins: [],
};

export default config;
