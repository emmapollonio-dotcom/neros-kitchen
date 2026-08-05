# N'sK — Istruzioni per riprendere il deploy

Situazione trovata: repo GitHub `neros-kitchen` già esistente e già collegato a Vercel (`neros-kitchen.vercel.app`), ma contiene solo una landing page statica (index.html + api/ + images/). Progetto Supabase `Neros-kitchen1` (eu-central-2) già creato, con URL e anon key già noti (vedi `web/.env.example`). Manca: caricare la piattaforma vera (questa cartella `nsk-scaffold`) al posto della landing, e collegare le chiavi mancanti.

Nessun comando da terminale richiesto — tutto via interfaccia web.

## 1. Ripulisci il repo GitHub

Vai su `github.com/emmapollonio-dotcom/neros-kitchen`. Per ciascuno di questi file/cartelle: apri il file → icona cestino (o "..." → Delete file) → commit direttamente su `main`:
- `index.html`
- `package.json`
- `api/`
- `images/`

## 2. Carica il nuovo codice

Sempre sul repo → **Add file → Upload files**. Apri Finder sulla cartella `nsk-scaffold` (quella selezionata in questa chat) e trascina dentro la zona di upload GitHub tutto il contenuto:

```
README.md
VERIFICATION.md
.gitignore
supabase/
web/
mobile/
scripts/
automation/
.github/
```

Commit diretto su `main`.

## 3. Vercel — Root Directory

Il progetto Next.js vive in `web/`, non nella root del repo. Vai sul progetto Vercel `neros-kitchen` → **Settings → General → Root Directory** → imposta `web` → Save.

## 4. Vercel — Environment Variables

Settings → Environment Variables, aggiungi (Production + Preview):

| Nome | Valore |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xjvrhoweghzfvwjsvwla.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | quello già in `web/.env.example` |
| `SUPABASE_SERVICE_ROLE_KEY` | da Supabase Dashboard → Project Settings → API → `service_role` secret — **mai nel repo, solo qui** |
| `NEXT_PUBLIC_SITE_URL` | `https://neros-kitchen.vercel.app` (o il tuo dominio custom) |
| `STRIPE_SECRET_KEY` | da Stripe Dashboard → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | da Stripe → Developers → Webhooks (crealo puntando a `/api/v1/webhooks/stripe` se non esiste) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | da Stripe Dashboard |
| `OPENAI_API_KEY` | da platform.openai.com (serve per l'Agent Orchestrator) |

## 5. Supabase — schema

Controlla se `supabase/schema.sql` è già stato eseguito sul progetto `Neros-kitchen1` (SQL Editor → verifica se le tabelle esistono già, es. `profiles`, `bookings`). Se hai dubbi, puoi rilanciarlo comunque: è scritto con `create table if not exists` ed enum con gestione duplicati, quindi non rompe nulla se rieseguito.

## 6. Redeploy

Se il push al passo 2 non ha già triggerato un deploy automatico: Vercel → Deployments → sull'ultimo → "..." → Redeploy.

## 7. Verifica

Apri `neros-kitchen.vercel.app` e controlla: home, `/pricing`, `/login`, una pagina chef `/chefs/[id]`. Se qualcosa dà errore 500, quasi certamente manca una env var del passo 4.

## 8. Opzionale — n8n

Importa `automation/n8n-workflows/bookings-notification.json` e `crm-lead-followup.json` in n8n (Workflows → Import from File), poi collega le credenziali email e i Database Webhooks di Supabase (Settings → Database → Webhooks) sulle tabelle `bookings` e `leads`.

### 8bis. Automazioni Zero Waste / HACCP / Social Studio (già live in n8n, manca solo il collegamento Supabase)

Le 3 automazioni sono già create, validate e attive nell'istanza n8n del progetto (workspace "Emmanuele Apollonio", nessun import manuale necessario — a differenza del punto 8 sopra, che si riferisce a workflow più vecchi distribuiti solo come file JSON):

- **N'sK - Zero Waste Cost Alert** — notifica quando uno spreco registrato supera 15€ di costo stimato (lookup ilike sul catalogo ingredienti via PostgREST, poi calcolo quantità × prezzo). Webhook: `https://nerosk.app.n8n.cloud/webhook/nsk/waste-webhook`.
- **N'sK - HACCP Daily Reminder** — promemoria email ogni giorno alle 8:00 per registrare le rilevazioni di temperatura. Nessun webhook: è uno Schedule Trigger, già attivo da solo, non richiede alcun collegamento Supabase.
- **N'sK - Social Post Ready Notification** — notifica quando un post generato dall'agente `social_content_creator` passa a status `ready`. Webhook: `https://nerosk.app.n8n.cloud/webhook/nsk/social-ready-webhook`.

Per attivare le prime due (quelle a webhook), in Supabase Dashboard → Settings → Database → Webhooks:

1. Nuovo webhook sulla tabella `waste_items`, evento **Insert**, URL `https://nerosk.app.n8n.cloud/webhook/nsk/waste-webhook`, metodo POST.
2. Nuovo webhook sulla tabella `social_posts`, evento **Update**, URL `https://nerosk.app.n8n.cloud/webhook/nsk/social-ready-webhook`, metodo POST (il workflow filtra da solo lato n8n i soli update che portano `status` a `ready`, quindi il webhook Supabase può restare "on every update" senza bisogno di condizioni).

Tutte e 3 sono già state testate end-to-end con payload reali (curl) subito dopo la creazione: email di conferma inviate correttamente via SendGrid, nessun errore nelle ultime esecuzioni.
