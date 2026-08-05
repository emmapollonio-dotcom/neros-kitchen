# N'sK — Come vengono gestiti i cambi di schema database

`supabase/schema.sql` è la fotografia più recente e completa dello schema (tabelle, RLS, funzioni). È scritto in modo idempotente (`create table if not exists`, gestione dei duplicati sugli enum), quindi può essere rieseguito senza rompere nulla — è utile come riferimento e per ricostruire lo schema da zero su un progetto Supabase nuovo (es. uno staging, se un giorno lo si crea).

**Non è però la fonte da cui parte il deploy**: ogni cambio di schema durante questa sessione è stato scritto come un file di migration a sé (`apply_migration`, con nome descrittivo tipo `add_rate_limiting`) ed eseguito direttamente sul progetto Supabase di produzione (`xjvrhoweghzfvwjsvwla`), poi la stessa modifica è stata riportata anche in `schema.sql` per tenerlo aggiornato come riferimento.

## Perché non è automatizzato in CI (a differenza del resto)

Il resto della pipeline (lint/typecheck/test web e mobile, deploy della Edge Function) è sicuro da automatizzare: se qualcosa si rompe, il danno è contenuto e reversibile con un nuovo deploy. Le migration Postgres sono diverse — sono spesso irreversibili in pratica (una colonna droppata perde i dati, anche se tecnicamente si può fare un rollback) e qui non esiste un progetto Supabase di staging separato da quello di produzione su cui testarle prima. Applicare in automatico, su ogni merge, modifiche scritte da un'AI a un database con prenotazioni e pagamenti reali di clienti veri è un rischio che vale la pena evitare, non un pezzo mancante da completare "per finire il lavoro".

## Come procedere oggi

Quando serve un cambio di schema, viene applicato direttamente (da me, con il tuo via libera se è una modifica rilevante) tramite Supabase MCP/CLI sul progetto di produzione, verificato subito dopo con una query di controllo, e poi riportato in `schema.sql`.

## Se in futuro vuoi automatizzare anche questo passo

Servirebbe un secondo progetto Supabase "staging" (anche nel piano gratuito) su cui la CI possa fare `supabase db push` ad ogni PR senza rischio, prima che la stessa migration venga promossa a produzione — è un passo in più di infrastruttura che si può aggiungere quando/se il volume di modifiche allo schema lo giustifica.
