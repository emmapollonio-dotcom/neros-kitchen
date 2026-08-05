# N'sK — Attivare le notifiche push (stato prenotazioni)

Il codice è pronto (app Flutter + Edge Function `booking-status-notify`, già deployata), ma le notifiche push richiedono sempre un account presso un servizio esterno — non posso crearlo per te. Ho scelto OneSignal invece di Firebase/APNs diretti perché il setup è molto più semplice (un solo account, niente certificati da gestire a mano nel codice) e il piano gratuito è ampio.

## Cosa fa già il codice
- L'app collega ogni utente loggato al suo "External ID" OneSignal (il suo id Supabase) — vedi `mobile/lib/core/notifications/onesignal_auth_bridge.dart`.
- Quando `bookings.status` cambia, un Database Webhook Supabase chiama la Edge Function `booking-status-notify`, che manda una push mirata al cliente e/o allo chef a seconda del nuovo stato (es. "Hai ricevuto un preventivo", "Prenotazione confermata").
- Finché non completi i passaggi sotto, tutto resta inattivo senza errori: l'app funziona normalmente senza push, e la Edge Function rifiuta ogni chiamata (401) perché il secret non è ancora impostato.

## Passaggi

### 1. Crea un account OneSignal (solo tu)
Vai su onesignal.com, registrati gratis, crea una nuova app scegliendo come piattaforma "Google Android" e "Apple iOS" (puoi aggiungerle entrambe alla stessa app OneSignal).

- **Android**: OneSignal ti guida a collegare un progetto Firebase (te lo crea/collega lui stesso nel flusso, non serve scrivere codice) — serve solo per la consegna delle notifiche, OneSignal fa da intermediario.
- **iOS**: serve una chiave APNs (.p8) dal tuo account Apple Developer (developer.apple.com → Certificates, Identifiers & Profiles → Keys). Se non hai ancora un account Apple Developer a pagamento, puoi completare Android per primo e aggiungere iOS più avanti.

### 2. Recupera App ID e REST API Key
OneSignal Dashboard → Settings → Keys & IDs:
- **OneSignal App ID**
- **REST API Key**

### 3. Genera un secret condiviso
Serve una stringa casuale che solo tu e la Edge Function conoscete, per evitare che chiunque scopra l'URL possa mandare push false. Puoi generarla così sul tuo Mac (Terminale):
```
openssl rand -hex 32
```

### 4. Imposta i secret della Edge Function (solo tu)
Supabase Dashboard → Edge Functions → `booking-status-notify` → Secrets (oppure via CLI `supabase secrets set`), aggiungi:
- `ONESIGNAL_APP_ID` → dal passo 2
- `ONESIGNAL_REST_API_KEY` → dal passo 2
- `BOOKING_WEBHOOK_SECRET` → la stringa generata al passo 3

### 5. Collega il Database Webhook
Supabase Dashboard → Database → Webhooks → Create a new hook:
- Tabella: `bookings`
- Evento: **Update**
- Tipo: HTTP Request → URL: `https://xjvrhoweghzfvwjsvwla.supabase.co/functions/v1/booking-status-notify`
- Metodo: POST
- HTTP Headers: aggiungi `x-webhook-secret` con lo stesso valore del passo 3

### 6. App mobile: passa l'App ID a build/run
Quando lanci o compili l'app, aggiungi il nuovo `--dart-define` insieme a quelli già in uso per Supabase:
```
flutter run --dart-define=SUPABASE_URL=... --dart-define=SUPABASE_ANON_KEY=... --dart-define=ONESIGNAL_APP_ID=<il tuo App ID>
```
(vedi `mobile/README.md` per l'elenco completo dei dart-define richiesti)

### 7. Test
Cambia manualmente lo `status` di una prenotazione di prova da Supabase Table Editor (es. da `requested` a `confirmed`): dovresti ricevere la push sul device dove hai fatto login nell'app (serve autorizzare le notifiche quando l'app lo chiede al primo avvio).

## Nota
Senza un account Apple Developer a pagamento (99$/anno), le push su iOS non sono testabili nemmeno con OneSignal configurato: è un requisito di Apple, non aggirabile. Android funziona anche senza.
