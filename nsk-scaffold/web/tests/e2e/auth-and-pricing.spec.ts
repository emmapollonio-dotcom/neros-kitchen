import { test, expect } from "@playwright/test";

// Flusso critico minimo (Step 12 Sprint 4): la landing carica, i piani reali
// (dalla tabella public.plans) sono visibili, e la pagina di login è raggiungibile.
// Estendere con signup -> conferma email -> login -> booking quando esiste
// un ambiente di staging con utenti di test (vedi playwright.config.ts).

test("la landing page mostra i moduli principali", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText("Food Cost")).toBeVisible();
});

test("la pagina pricing mostra i piani da database", async ({ page }) => {
  await page.goto("/pricing");
  await expect(page.getByText("N'sK Home Free")).toBeVisible();
  await expect(page.getByText("Gratis")).toBeVisible();
});

test("login page ha i campi email e password", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
});

test("route protetta reindirizza al login se non autenticato", async ({ page }) => {
  await page.goto("/pro/food-cost");
  await expect(page).toHaveURL(/\/login/);
});
