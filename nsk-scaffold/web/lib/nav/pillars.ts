// Fonte unica dell'informazione architetturale del prodotto: i 4 pilastri
// (Home personale, N'sK Home, N'sK Pro, Marketplace) e le loro voci. Usata
// dalla nav applicativa (AppNavClient) e dalla dashboard — se cambia l'IA,
// cambia solo qui. Label e descrizioni arrivano dal namespace i18n
// "pillars" (vedi messages/*.json), passato come funzione di traduzione
// dal chiamante (useTranslations lato client, getTranslations lato server)
// così questo modulo resta senza dipendenze da next-intl/react.
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

type PillarTranslator = (key: string) => string;

export function getNskHomeItems(t: PillarTranslator): NavItem[] {
  return [
    { label: t("recipes.label"), href: "/ricette", description: t("recipes.description") },
    { label: t("mealPlanner.label"), href: "/meal-planner", description: t("mealPlanner.description") },
    { label: t("shoppingList.label"), href: "/lista-spesa", description: t("shoppingList.description") },
    { label: t("zeroWaste.label"), href: "/zero-waste", description: t("zeroWaste.description") },
    { label: t("tutorAi.label"), href: "/tutor-ai", description: t("tutorAi.description") },
  ];
}

export function getNskProItems(t: PillarTranslator): NavItem[] {
  return [
    { label: t("foodCost.label"), href: "/food-cost", description: t("foodCost.description") },
    { label: t("haccp.label"), href: "/haccp", description: t("haccp.description") },
    { label: t("crm.label"), href: "/crm", description: t("crm.description") },
    { label: t("analytics.label"), href: "/analytics", description: t("analytics.description") },
    { label: t("academyPro.label"), href: "/academy-pro", description: t("academyPro.description") },
  ];
}
