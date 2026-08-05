// Fonte unica dell'informazione architetturale del prodotto: i 4 pilastri
// (Home personale, N'sK Home, N'sK Pro, Marketplace) e le loro voci. Usata
// dalla nav applicativa (AppNavClient) — se cambia l'IA, cambia solo qui.
//
// Academy (corsi) è confluita dentro Tutor AI (hub di apprendimento unico,
// come MasterClass: guida AI personalizzata + corsi strutturati).
// Ingredienti è confluita dentro Food Cost, Recensioni dentro CRM,
// Social Studio dentro Analytics — meno voci di menu separate, ognuna con
// uno scopo chiaro (criterio Notion/Stripe).

export interface NavItem {
  label: string;
  href: string;
  description: string;
}

export const NSK_HOME_ITEMS: NavItem[] = [
  { label: "Ricette", href: "/ricette", description: "Il tuo ricettario, con food cost calcolato in automatico." },
  { label: "Meal Planner", href: "/meal-planner", description: "Pianifica la settimana a tavola in pochi minuti." },
  { label: "Lista della spesa", href: "/lista-spesa", description: "Generata dal planner, o gestita a mano." },
  { label: "Zero Waste", href: "/zero-waste", description: "Trasforma gli scarti in nuove idee, non in rifiuti." },
  { label: "Tutor AI", href: "/tutor-ai", description: "Guida personalizzata e corsi con i migliori chef." },
];

export const NSK_PRO_ITEMS: NavItem[] = [
  { label: "Food Cost", href: "/food-cost", description: "Costi, margini e prezzi — con il catalogo ingredienti." },
  { label: "HACCP", href: "/haccp", description: "Punti di controllo e temperature, sempre in regola." },
  { label: "CRM", href: "/crm", description: "Lead, clienti e le loro recensioni in un solo posto." },
  { label: "Analytics", href: "/analytics", description: "Performance del business e contenuti social." },
  { label: "Academy Pro", href: "/academy-pro", description: "Crea e vendi i tuoi corsi ad altri chef." },
];
