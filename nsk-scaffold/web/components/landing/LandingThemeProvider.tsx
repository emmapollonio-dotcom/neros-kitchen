"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface LandingThemeContextValue {
  isDark: boolean;
  toggle: () => void;
}

const LandingThemeContext = createContext<LandingThemeContextValue | null>(null);

// Stato del toggle chiaro/scuro della landing, come da spec (default light —
// isDark: false). Scoped a questa route: non è il tema del resto dell'app
// (che è permanentemente scuro), è un'interazione richiesta esplicitamente
// dal design handoff. Il data-theme sul wrapper guida le CSS var in
// .nsk-landing (globals.css).
export function LandingThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);

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
