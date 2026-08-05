# N'sK — Passaggio Stripe da test a live

Audit del codice: **il codice è già pronto per il live mode**, non serve nessuna modifica — legge tutto da variabili d'ambiente (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`), nessun valore Stripe è hardcoded nel repo. Il passaggio a live è quasi interamente operativo, e alcuni passaggi possono farli solo tu (verifica d'identità, dati bancari, chiavi live — mai da incollare in chat con me).

## Cosa già c'è

- Stripe Checkout per abbonamenti (`/api/v1/subscriptions/checkout`)
- Stripe Connect Express per i pagamenti agli chef (`/api/v1/chefs/connect`, destination charge con commissione piattaforma in `/api/v1/bookings/[id]/pay`)
- Webhook unico (`/api/v1/webhooks/stripe`) che gestisce `payment_intent.succeeded/failed`, `checkout.session.completed`, `customer.subscription.updated/deleted`

## Checklist — nell'ordine

### 1. Verifica identità/attività su Stripe (solo tu)
Stripe Dashboard → Attiva il tuo account (business details, IBAN, documento). Necessario sia per i pagamenti diretti sia — punto successivo — per Stripe Connect come piattaforma. Può richiedere qualche giorno di revisione da parte di Stripe.

### 2. Attivare Stripe Connect come piattaforma (solo tu)
Il codice crea account Connect **Express** per ogni chef (`stripe.accounts.create({type: "express", ...})`). Se non l'hai già fatto in test mode, su Stripe Dashboard → Connect → Impostazioni, attiva il programma Connect e configura il profilo piattaforma (nome, logo, che tipo di attività fai da marketplace).

### 3. Ricreare Prodotti/Prezzi in modalità live
Live e test mode su Stripe sono due cataloghi completamente separati: i 6 price ID salvati oggi in `public.plans` sono test-mode e **non funzionano in live**. Su Stripe Dashboard (con il toggle "Test mode" spento), ricrea gli stessi 4 piani con paganti mensile+annuale:

| Piano | Mensile | Annuale |
|---|---|---|
| N'sK Home Premium | €6.99 | €69.90 |
| N'sK Pro Starter | €29 | €290 |
| N'sK Pro Growth | €79 | €790 |

(Home Free resta gratis, nessun price Stripe necessario.)

Quando hai i 6 nuovi `price_...` id, mandameli e aggiorno io il database con una query tipo:

```sql
update public.plans set stripe_price_id_monthly = 'price_...', stripe_price_id_yearly = 'price_...' where code = 'home_premium';
update public.plans set stripe_price_id_monthly = 'price_...', stripe_price_id_yearly = 'price_...' where code = 'pro_starter';
update public.plans set stripe_price_id_monthly = 'price_...', stripe_price_id_yearly = 'price_...' where code = 'pro_growth';
```

### 4. Chiavi live su Vercel (solo tu, mai in chat)
Stripe Dashboard (live mode) → Developers → API keys: copia `sk_live_...` e `pk_live_...`.
Vercel → progetto → Settings → Environment Variables (Production):
- `STRIPE_SECRET_KEY` → `sk_live_...`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → `pk_live_...`

Inseriscile tu direttamente su Vercel — è un dato sensibile che non deve passare da questa chat.

### 5. Nuovo webhook live
Stripe Dashboard (live mode) → Developers → Webhooks → Aggiungi endpoint:
- URL: `https://neros-kitchen.vercel.app/api/v1/webhooks/stripe`
- Eventi: `payment_intent.succeeded`, `payment_intent.payment_failed`, `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

Copia il nuovo `whsec_...` (diverso da quello di test) e impostalo su Vercel come `STRIPE_WEBHOOK_SECRET` (Production).

### 6. Controlla `NEXT_PUBLIC_SITE_URL` su Vercel
Deve essere `https://neros-kitchen.vercel.app` (non `localhost`) in Production — altrimenti i redirect di Checkout/Connect onboarding puntano al posto sbagliato.

### 7. Redeploy
Dopo aver impostato le env var, rideploya (Vercel → Deployments → ultimo → Redeploy) così vengono iniettate.

### 8. Onboarding Connect per te stesso come chef
Se anche tu userai la piattaforma come chef, il tuo `stripe_account_id` di test non è valido in live: dovrai rifare l'onboarding Connect (`/pro/settings/payouts` → bottone connesso a `/api/v1/chefs/connect`) una volta in live.

### 9. Test con un pagamento reale minimo
Una prenotazione a importo basso (es. €1) end-to-end, poi rimborso da Stripe Dashboard se vuoi annullarlo. Verifica che `payments.status` passi a `paid` e `bookings.status` a `confirmed` (via webhook).

## Cosa NON farò mai per te
Inserire chiavi Stripe, dati bancari/IBAN, o completare la verifica d'identità — sono azioni che deve fare solo tu, direttamente su Stripe e Vercel.
