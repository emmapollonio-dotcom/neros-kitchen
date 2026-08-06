# N'sK — Come vengono gestiti i cambi di schema database

`supabase/schema.sql` è la fotografia più recente e completa dello schema (tabelle, RLS, funzioni). È scritto in modo idempotente (`create table if not exists`, gestione dei duplicati sugli enum), quindi può essere rieseguito senza rompere nulla — utile come riferimento leggibile, ma **non più l'unica fonte per ricostruire lo schema**: da oggi (6 agosto) quel ruolo è di `supabase/migrations/*.sql`, una cartella con i 18 file di migration reali applicati a produzione in ordine, uno per uno.

Quella cartella non esisteva fino ad oggi: ogni `apply_migration` fatto durante le sessioni precedenti scriveva sul progetto Supabase remoto ma non lasciava un file corrispondente nel repo. Ricostruita l'intera cronologia da `supabase_migrations.schema_migrations` (dove Supabase la tiene comunque, anche senza file locali) e salvata come file versionati — passo necessario per far funzionare l'automazione descritta sotto.

**Due buchi trovati e chiusi durante la ricostruzione**: le tabelle HACCP/Social Media Studio e il fix alla ricorsione infinita su `profiles_self_read` (bug 42P17) erano stati applicati in produzione via query dirette, mai passate da `apply_migration` — quindi assenti dalla cronologia tracciata. Richiusi il 6 agosto come migration a sé (`backfill_untracked_*`), applicate sia a produzione (idempotenti, nessun impatto sui dati) sia al nuovo staging, così ora la cronologia è completa su entrambi.

## Cos'è cambiato: ora esiste uno staging, ma la produzione resta manuale

Il ragionamento originale restava valido — le migration Postgres sono spesso irreversibili in pratica (una colonna droppata perde i dati) e applicarle in automatico su un database con prenotazioni e pagamenti reali, senza prima testarle da qualche parte, è un rischio evitabile. La parte mancante era l'ambiente di prova: non esisteva un secondo progetto Supabase.

Il 6 agosto è stato allestito staging riusando un progetto Supabase vuoto e dimenticato ("Neros-kitchen", `qpgjfrlpztoqrttjirpn`, eu-west-1 — creato lo stesso giorno di quello di produzione durante un primo tentativo di setup, mai più toccato), con lo schema replicato 1:1 (18 migration, stesse tabelle, stesse policy, stessi advisor findings verificati con `get_advisors` su entrambi gli ambienti).

**Cosa è automatico ora**: ogni push/PR su GitHub applica i file di `supabase/migrations/` a staging via CI (`supabase db push`, job `migrate-staging` in `.github/workflows/ci.yml`) — vedi `CI-CD-SETUP.md` per i secret da aggiungere.

**Cosa resta manuale, di proposito**: la promozione a produzione. Anche con staging verde, la stessa migration va comunque applicata a produzione a mano (via Supabase MCP `apply_migration`) e verificata con una query di controllo subito dopo. Staging riduce il rischio di un errore di sintassi o di un vincolo che rompe dati — non sostituisce una verifica finale su produzione, che resta un passo deliberato, non un merge automatico.

## Come procedere oggi

1. Nuovo file in `supabase/migrations/<timestamp>_<nome>.sql`.
2. Push/PR → CI lo applica a staging in automatico.
3. Se staging è verde, applicato a mano a produzione (io, via Supabase MCP, con il tuo via libera se è una modifica rilevante), verificato subito dopo, poi la stessa modifica riportata anche in `schema.sql` come riferimento leggibile.
