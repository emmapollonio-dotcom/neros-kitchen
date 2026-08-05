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
      <div className="flex gap-1 border-b border-line">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`relative px-4 py-3 font-body text-sm transition ${
              active === tab.id ? "text-charcoal" : "text-mist hover:text-smoke"
            }`}
          >
            {tab.label}
            {active === tab.id && (
              <span className="absolute inset-x-4 -bottom-px h-0.5 rounded-full bg-charcoal" />
            )}
          </button>
        ))}
      </div>
      <div className="mt-8">{tabs.find((t) => t.id === active)?.content}</div>
    </div>
  );
}
