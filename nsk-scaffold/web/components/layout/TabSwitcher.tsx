"use client";

import { useState, type ReactNode } from "react";

export interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

// Switcher generico usato per consolidare pagine N'sK Pro affini (es. Food
// Cost + Ingredienti, CRM + Recensioni, Analytics + Social Studio) senza
// moltiplicare le voci di menu — criterio Notion/Stripe: una pagina, una
// destinazione chiara, con le sezioni correlate a un click di distanza.
export function TabSwitcher({ tabs, defaultTab }: { tabs: Tab[]; defaultTab?: string }) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id);

  return (
    <div>
      {/* Vive direttamente sullo scafo (Food Cost, CRM, Analytics, Academy
          Pro lo montano subito sotto il sottotitolo, fuori da qualunque
          card bianca): token shell-aware, non i toni pensati per card
          chiare (border-card-border/text-card-fg/text-card-fg-muted erano illeggibili
          sullo sfondo scuro/navy). */}
      <div className="flex gap-1 border-b border-shell-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`relative px-4 py-3 font-body text-sm transition ${
              active === tab.id ? "text-teal" : "text-shell-fg-muted hover:text-shell-fg-secondary"
            }`}
          >
            {tab.label}
            {active === tab.id && (
              <span className="absolute inset-x-4 -bottom-px h-0.5 rounded-full bg-teal" />
            )}
          </button>
        ))}
      </div>
      <div className="mt-8">{tabs.find((t) => t.id === active)?.content}</div>
    </div>
  );
}
