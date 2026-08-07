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
        // Accento del brand: teal (6 ago 2026, adottato dal design handoff
        // della landing page e poi esteso a TUTTA l'app — sostituisce il
        // precedente accento gold ovunque, bg-gold/text-gold ecc. sono stati
        // rinominati bg-teal/text-teal in ogni file). Le superfici scure del
        // toggle chiaro/scuro della landing vivono in globals.css sotto
        // .nsk-landing come CSS var, non qui.
        teal: "#117E8E",
        "teal-dark": "#0C5F6B",
        smoke: "#555555",
        mist: "#8A8580",
        line: "#E7E1D6",
        // Guscio scuro (nav, sfondo pagina, header di sezione): il testo
        // secondario qui usa questi due, non smoke/mist (pensati per testo
        // scuro su card bianche, illeggibili su charcoal). "haze" fa da
        // bordo/divider sul fondo scuro.
        haze: "rgba(245, 241, 234, 0.12)",
        // Token "shell" (7 ago 2026) — legati a CSS var in globals.css,
        // invertiti da html.theme-light. Usarli per lo scafo applicativo
        // (nav, layout wrapper, testo diretto su sfondo pagina); NON per le
        // card (restano bg-white/text-charcoal fissi, vedi commento in
        // globals.css). charcoal/ivory/haze sopra restano tali e quali,
        // servono ancora per bottoni/badge che devono restare fissi.
        shell: "var(--nsk-shell-bg)",
        "shell-fg": "var(--nsk-shell-fg)",
        "shell-fg-secondary": "var(--nsk-shell-fg-secondary)",
        "shell-fg-muted": "var(--nsk-shell-fg-muted)",
        "shell-border": "var(--nsk-shell-border)",
        // Token "card" (7 ago 2026) — superfici di form/tabelle/liste dentro
        // lo scafo. In dark riusano la stessa card-bg navy della landing
        // (#22344f), in tema chiaro restano bianche come da sempre. Sostituiscono
        // bg-white/text-charcoal/text-smoke/text-mist/bg-cream/border-line
        // ovunque il contenuto viva dentro una card, non sullo scafo nudo.
        card: "var(--nsk-card-bg)",
        "card-alt": "var(--nsk-card-alt-bg)",
        "card-fg": "var(--nsk-card-fg)",
        "card-fg-secondary": "var(--nsk-card-fg-secondary)",
        "card-fg-muted": "var(--nsk-card-fg-muted)",
        "card-border": "var(--nsk-card-border)",
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
