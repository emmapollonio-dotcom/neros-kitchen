# N'sK — Attivare il monitoraggio errori (Sentry)

Il codice è già pronto: `@sentry/nextjs` è integrato e inizializzato in modo condizionale — se le variabili d'ambiente sotto non sono impostate, Sentry resta completamente disattivato e il sito funziona esattamente come prima (nessun crash, nessuna dipendenza obbligatoria). Non posso creare l'account Sentry per te (richiede una registrazione), quindi questi passaggi restano tuoi.

## Cosa già c'è nel codice
- `web/instrumentation.ts` — inizializza Sentry lato server ed edge runtime
- `web/instrumentation-client.ts` — inizializza Sentry lato browser
- `web/app/global-error.tsx` — cattura gli errori di rendering React non gestiti altrove
- `web/next.config.mjs` — carica il plugin Sentry solo se configurato, per l'upload dei sourcemap

## Passaggi

### 1. Crea un account Sentry (solo tu)
Vai su sentry.io, crea un account gratuito (il piano free copre ampiamente le esigenze di partenza), crea un progetto di tipo "Next.js".

### 2. Copia il DSN
Sentry ti mostra un DSN tipo `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`. Su Vercel → progetto → Settings → Environment Variables (Production), aggiungi:
- `SENTRY_DSN` → il DSN (lato server)
- `NEXT_PUBLIC_SENTRY_DSN` → lo stesso DSN (lato browser — deve essere `NEXT_PUBLIC_` per essere visibile al client)

Con solo queste due variabili impostate, gli errori iniziano ad arrivare su Sentry. Gli step successivi sono opzionali (migliorano la qualità degli stack trace ma non sono indispensabili per partire).

### 3. (opzionale) Sourcemap leggibili
Senza un auth token, Sentry riceve comunque gli errori ma con stack trace "minificati" (meno leggibili). Per averli puliti: Sentry → Settings → Auth Tokens → crea un token con permesso `project:releases`, poi su Vercel aggiungi:
- `SENTRY_ORG` → lo slug della tua organizzazione Sentry
- `SENTRY_PROJECT` → lo slug del progetto
- `SENTRY_AUTH_TOKEN` → il token appena creato (dato sensibile, mai da incollare in chat)

### 4. Redeploy
Dopo aver impostato le variabili, rideploya da Vercel perché vengano iniettate.

## Nota sull'Edge Function (Agent Orchestrator)
Gli errori dell'Edge Function `agent-orchestrator` (dove girano gli agenti AI) non passano da Sentry: restano visibili nei log nativi di Supabase (Dashboard → Edge Functions → Logs), che coprono già lo stesso bisogno per quella parte di sistema senza aggiungere una dipendenza extra a un runtime Deno più delicato da instrumentare.
