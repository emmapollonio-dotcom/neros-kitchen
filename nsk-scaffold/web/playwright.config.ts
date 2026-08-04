import { defineConfig, devices } from "@playwright/test";

// E2E flusso critico (Step 12, Sprint 4). Richiede: `npm run dev` attivo e
// un progetto Supabase di staging con dati seed (vedi supabase/schema.sql).
// Non eseguito in questa sessione (nessun accesso a browser/registry), ma
// pronto per girare in CI (.github/workflows/ci.yml può aggiungere un job
// `e2e` che lancia `npx playwright test` dopo il deploy su staging).
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: "html",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
