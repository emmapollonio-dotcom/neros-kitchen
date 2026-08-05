# N'sK (Nero's Kitchen) — Recap progetto, 5 agosto 2026

## Cosa è live e funzionante oggi

**Piattaforma web** (`neros-kitchen.vercel.app`, Next.js + Supabase + Stripe): marketplace chef, prenotazioni con preventivo e pagamento (Stripe Connect Express, destination charge con commissione piattaforma), abbonamenti (Home Free/Premium, Pro Starter/Growth), academy con quiz, CRM lead, recensioni.

**Moduli aggiunti in questa sessione, tutti verificati in produzione** (typecheck + test + build + deploy + verifica live):
- Gestione ingredienti (catalogo, prezzi, admin UI)
- Zero Waste (tracciamento sprechi + consulente AI)
- Social Media Studio (generazione contenuti AI, riservato al piano Pro Growth)
- HACCP (punti di controllo, letture, azioni correttive, consulente AI)
- 4 nuovi agenti AI: qualificazione lead CRM, tutor academy (spiega perché hai sbagliato un quiz), risposta automatica alle recensioni, rilevamento allergeni nelle ricette
- Corretto un bug pre-esistente: la creazione ricetta portava a una pagina 404

**Automazioni n8n** (attive su `nerosk.app.n8n.cloud`):
- Alert quando il costo di uno spreco supera €15
- Promemoria giornaliero HACCP (ore 8:00)
- Notifica quando un post social è pronto

**App mobile** (Flutter, `mobile/`): 4 sezioni (marketplace chef, prenotazioni, zero waste, profilo), login/signup, routing con redirect automatico su stato auth. Verificata oggi con toolchain reale: `flutter pub get`, `flutter analyze` (0 problemi) e `flutter test` (7/7) tutti puliti.

## Cosa manca o richiede un'azione tua

**Stripe — ancora in modalità test.** Il codice è pronto per il live, ma servono passaggi che solo tu puoi fare: verifica identità/attività su Stripe, attivazione Connect come piattaforma, ricreazione di prodotti/prezzi in modalità live, chiavi live su Vercel, nuovo webhook live, un pagamento di prova reale. Checklist completa già pronta in `STRIPE-GO-LIVE.md`.

**Dominio personalizzato — da registrare.** Rimandato per tua scelta, nessuna urgenza: il sito funziona bene su `neros-kitchen.vercel.app`. Guida già pronta in `DOMINIO-CUSTOM.md` per quando deciderai.

**2 webhook Supabase da collegare manualmente** (documentati in `DEPLOY-ISTRUZIONI.md`, sezione 8bis): `waste_items` insert → automazione alert sprechi, `social_posts` update → notifica post pronto. Le automazioni n8n esistono e funzionano già se chiamate direttamente; mancano solo i due "fili" che le fanno scattare automaticamente dal database.

**App mobile — verificata ma non ancora pubblicata.** Nessuna pipeline per generare build iOS/Android firmate, nessuna icona/splash screen personalizzata oltre i default Flutter, nessuna notifica push, nessun test sulla sincronizzazione offline (drift/sqlite sono tra le dipendenze ma non ancora usate per una vera cache locale). La app dichiara 5 lingue supportate (it/en/fr/es/ar) ma i testi nel codice sono tutti hardcoded in italiano — le altre lingue non sono ancora tradotte.

**Nessuna pagina legale.** Non ho trovato privacy policy, termini di servizio, o banner cookie/consenso GDPR nel sito. Per un'azienda che raccoglie dati di pagamento e prenotazioni, soprattutto in Italia/UE, è un tassello da non rimandare troppo.

**Nessun monitoraggio errori in produzione** (tipo Sentry) e nessun rate-limiting sulle rotte API o sugli agenti AI — quest'ultimo in particolare espone a un rischio di costi OpenAI incontrollati se qualcuno abusasse degli endpoint.

**CI/CD**: esiste già una pipeline GitHub Actions (lint/typecheck/test per web, analyze/test per mobile, verifica schema) — l'ho appena corretta perché pinnava una versione Flutter troppo vecchia (incompatibile con la modifica di oggi). Manca però il deploy automatico verso produzione: oggi ogni deploy (web, Edge Function, migration) l'ho fatto io a mano via CLI/MCP.

## Suggerimento sulla priorità

Se l'obiettivo a breve è iniziare a operare con clienti reali, l'ordine più sensato è: pagine legali (privacy/termini) → Stripe live → dominio custom → pubblicazione app store. Se invece l'obiettivo resta rifinire la piattaforma prima del lancio, monitoraggio errori e rate-limiting sugli agenti AI vengono prima di tutto il resto.

Dimmi da dove vuoi ripartire.
