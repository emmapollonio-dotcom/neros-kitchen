import type { Config } from "tailwindcss";

// Design system N'sK — Luxury Minimalist
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        charcoal: "#121212",
        ivory: "#F5F1EA",
        gold: "#C8A96B",
        smoke: "#555555",
      },
      fontFamily: {
        // Caricati via next/font/google in app/layout.tsx come CSS variable —
        // niente <link> esterni, niente layout shift.
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      borderRadius: {
        nsk: "6px",
      },
    },
  },
  plugins: [],
};

export default config;
