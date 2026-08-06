# N'sK — Attivare il deploy automatico (CI/CD)

Stato dei quattro pezzi della pubblicazione:

| Cosa | Automatico? | Note |
|---|---|---|
| Sito web (Vercel) | Sì, già attivo | Il repo è collegato a Vercel: ogni push su `main` triggera da solo un deploy (vedi `DEPLOY-ISTRUZIONI.md`, punto 6). Nessuna azione richiesta. |
| Agent Orchestrator (Edge Function) | Sì, da ora — richiede 1 secret GitHub | Vedi sotto. Prima era un deploy manuale fatto da me ad ogni modifica. |
| Migration database → **staging** | Sì, da ora — richiede 2 secret GitHub | Vedi sotto. Nuovo: prima non esisteva un ambiente di staging. |
| Migration database → **produzione** | No, di proposito | Resta manuale (io, via Supabase MCP, con verifica subito dopo) anche ora che esiste staging — vedi `MIGRAZIONI.md` per il perché e per il flusso completo. |

## Attivare il deploy automatico della Edge Function

Serve un solo secret su GitHub, da aggiungere tu (richiede il tuo login Supabase, non posso farlo da qui).

1. Vai su [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens) (Account → Access Tokens) e crea un nuovo token, es. chiamato "GitHub Actions N'sK".
2. Vai sul repo GitHub `neros-kitchen` → Settings → Secrets and variables → Actions → New repository secret:
   - Nome: `SUPABASE_ACCESS_TOKEN`
   - Valore: il token appena creato (dato sensibile — non condividerlo in chat, va incollato solo nel campo di GitHub)
3. Fatto. Al prossimo push su `main` che passa i controlli (lint/typecheck/test web e mobile), il job `deploy-edge-function` in `.github/workflows/ci.yml` pubblica automaticamente l'ultima versione di `supabase/functions/agent-orchestrator/` sul progetto di produzione.

Puoi verificare che sia andato a buon fine da GitHub → tab "Actions" del repo, oppure da Supabase Dashboard → Edge Functions → agent-orchestrator (il numero di versione sale).

Finché il secret non è impostato, il job fallisce silenziosamente con un errore di autenticazione — non blocca gli altri job (lint/typecheck/test continuano a girare normalmente), semplicemente il deploy della Edge Function resta manuale come prima finché non aggiungi il token.

## Attivare l'apply automatico delle migration su staging

Riusa lo stesso `SUPABASE_ACCESS_TOKEN` di sopra, più uno nuovo per la password del database di staging (serve perché `supabase db push` si collega direttamente a Postgres, non solo alla Management API).

1. Se non l'hai già fatto per l'Edge Function, crea `SUPABASE_ACCESS_TOKEN` come sopra.
2. Vai su Supabase Dashboard → progetto **"Neros-kitchen"** (project ref `qpgjfrlpztoqrttjirpn`, regione eu-west-1 — questo è l'ambiente di staging, non quello di produzione "Neros-kitchen1") → Project Settings → Database → copia la password del database (o resettala se non la ricordi più).
3. Repo GitHub → Settings → Secrets and variables → Actions → New repository secret:
   - Nome: `SUPABASE_STAGING_DB_PASSWORD`
   - Valore: la password copiata al passo 2
4. Fatto. Da ora ogni push/PR esegue il job `migrate-staging`, che applica tutti i file in `supabase/migrations/` (18 al momento, replicati dalla cronologia di produzione il 6 agosto) al progetto di staging con `supabase db push`.

## Il flusso completo per un nuovo cambio di schema, da oggi in poi

1. Scrivi il nuovo file in `supabase/migrations/<timestamp>_<nome>.sql` (stesso formato degli esistenti).
2. Push/PR → CI applica automaticamente la migration su staging → se fallisce (sintassi, vincolo che rompe dati di test), lo vedi subito in GitHub Actions, prima di toccare produzione.
3. Se staging è verde, applica la stessa migration a produzione a mano (io, via Supabase MCP `apply_migration`), poi verifico con una query di controllo — esattamente come oggi, ma ora con una prova generale automatica prima.

## Nota sul progetto di staging

"Neros-kitchen" (senza l'"1") era un progetto Supabase vuoto, creato lo stesso giorno di quello di produzione durante un primo tentativo di setup, poi abbandonato — trovato il 6 agosto mentre si cercava di creare un progetto di staging da zero e si è scoperto il limite di 2 progetti gratuiti per organizzazione. Riusato al posto di crearne uno nuovo: zero costi aggiuntivi. Se preferisci un nome meno ambiguo, puoi rinominarlo da Supabase Dashboard → quel progetto → Settings → General (due minuti, richiede il tuo login, non l'ho potuto fare da qui).
