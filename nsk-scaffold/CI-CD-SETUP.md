# N'sK — Attivare il deploy automatico (CI/CD)

Stato dei tre pezzi della pubblicazione:

| Cosa | Automatico? | Note |
|---|---|---|
| Sito web (Vercel) | Sì, già attivo | Il repo è collegato a Vercel: ogni push su `main` triggera da solo un deploy (vedi `DEPLOY-ISTRUZIONI.md`, punto 6). Nessuna azione richiesta. |
| Agent Orchestrator (Edge Function) | Sì, da ora — richiede 1 secret GitHub | Vedi sotto. Prima era un deploy manuale fatto da me ad ogni modifica. |
| Migration database | No, di proposito | Vedi `MIGRAZIONI.md` per il perché. |

## Attivare il deploy automatico della Edge Function

Serve un solo secret su GitHub, da aggiungere tu (richiede il tuo login Supabase, non posso farlo da qui).

1. Vai su [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens) (Account → Access Tokens) e crea un nuovo token, es. chiamato "GitHub Actions N'sK".
2. Vai sul repo GitHub `neros-kitchen` → Settings → Secrets and variables → Actions → New repository secret:
   - Nome: `SUPABASE_ACCESS_TOKEN`
   - Valore: il token appena creato (dato sensibile — non condividerlo in chat, va incollato solo nel campo di GitHub)
3. Fatto. Al prossimo push su `main` che passa i controlli (lint/typecheck/test web e mobile), il job `deploy-edge-function` in `.github/workflows/ci.yml` pubblica automaticamente l'ultima versione di `supabase/functions/agent-orchestrator/` sul progetto di produzione.

Puoi verificare che sia andato a buon fine da GitHub → tab "Actions" del repo, oppure da Supabase Dashboard → Edge Functions → agent-orchestrator (il numero di versione sale).

## Nota

Finché il secret non è impostato, il job fallisce silenziosamente con un errore di autenticazione — non blocca gli altri job (lint/typecheck/test continuano a girare normalmente), semplicemente il deploy della Edge Function resta manuale come prima finché non aggiungi il token.
