"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface LandingThemeContextValue {
  isDark: boolean;
  toggle: () => void;
}

const LandingThemeContext = createContext<LandingThemeContextValue | null>(null);

// Stato del toggle chiaro/scuro della landing. Default scuro (10 ago 2026,
// cambiato da light) — la nuova palette nero+oro ispirata a
// neroskitchen.co.uk è pensata per essere vista scura di default, come il
// sito di riferimento; il toggle resta comunque disponibile. Scoped a
// questa route: non è il tema del resto dell'app (permanentemente scuro
// navy+teal). Il data-theme sul wrapper guida le CSS var in .nsk-landing
// (globals.css).
export function LandingThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(true);

  return (
    <LandingThemeContext.Provider value={{ isDark, toggle: () => setIsDark((v) => !v) }}>
      <div className="nsk-landing" data-theme={isDark ? "dark" : "light"}>
        {children}
      </div>
    </LandingThemeContext.Provider>
  );
}

export function useLandingTheme() {
  const ctx = useContext(LandingThemeContext);
  if (!ctx) throw new Error("useLandingTheme must be used within LandingThemeProvider");
  return ctx;
}
