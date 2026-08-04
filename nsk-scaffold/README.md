# N'sK — Code Scaffold (Step 13)

Starter kit eseguibile, coerente con l'architettura descritta in `NSK_Master_Architecture.md`. Non è l'intera piattaforma (impossibile in una sessione) ma una base reale su cui uno sviluppatore può continuare direttamente.

## Contenuto

```
nsk-scaffold/
├── VERIFICATION.md             # Cosa è testato, come, e con quale risultato reale
├── scripts/
│   └── verify_schema.py        # Verifica statica schema (RLS coverage, FK, sintassi) — zero dipendenze
├── .github/workflows/ci.yml    # Lint + typecheck + test (web/mobile/schema) su ogni PR
├── supabase/
│   └── schema.sql              # Schema DB completo, RLS su tutte le tabelle, eseguibile su progetto Supabase vuoto
├── web/                        # Starter Next.js (App Router + TypeScript)
│   ├── package.json
│   ├── .env.example
│   ├── middleware.ts           # Route guard per ruolo (RBAC)
│   ├── tailwind.config.ts      # Design tokens N'sK (charcoal/ivory/gold/smoke)
│   ├── lib/supabase/           # Client server + browser
│   ├── lib/food-cost/          # Funzione pura di calcolo + unit test
│   ├── lib/validators/         # Schema zod + unit test
│   └── app/
│       ├── layout.tsx, globals.css               # Font Playfair/Montserrat, design tokens
│       ├── (marketing)/page.tsx, pricing/page.tsx # Landing + pricing (piani letti da DB)
│       ├── (auth)/login, (auth)/signup           # Pagine auth (email/password + Google)
│       ├── auth/callback/route.ts                # Callback OAuth
│       ├── bookings/page.tsx                     # Lista prenotazioni utente (RLS-filtered)
│       ├── api/v1/food-cost/calculate/route.ts   # Logica reale calcolo food cost
│       ├── api/v1/bookings/route.ts              # CRUD prenotazioni con RLS
│       └── (marketplace)/chefs/[chefId]/
│           ├── page.tsx                          # Profilo pubblico chef (SSR)
│           └── book/page.tsx                     # Calendario disponibilità + form richiesta
├── components/booking/           # AvailabilityCalendar + BookingForm (client components)
├── mobile/                     # Starter Flutter
│   ├── pubspec.yaml
│   └── lib/, test/
│       ├── main.dart, app.dart
│       ├── core/theme/colors.dart                # Stessi design tokens del web
│       └── features/marketplace, features/auth   # Repository + screen Riverpod + test
└── automation/n8n-workflows/
    ├── bookings-notification.json                # Import diretto in n8n
    └── crm-lead-followup.json                    # Import diretto in n8n
```

## Come usarlo

1. **Database**: crea un progetto Supabase (region EU), incolla `supabase/schema.sql` nello SQL Editor ed eseguilo.
2. **Web**: `cd web && npm install`, crea `.env.local` con `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, poi `npm run dev`.
3. **Mobile**: `cd mobile && flutter pub get`, esegui con `flutter run --dart-define=SUPABASE_URL=... --dart-define=SUPABASE_ANON_KEY=...`.
4. **n8n**: importa i due file `.json` da Workflows → Import from File; collega le credenziali email e il webhook Supabase Database Webhooks (Settings → Database → Webhooks) sulle tabelle `bookings` e `leads`.

## Stato di avanzamento (Sprint 1-5 di 6 completati, vedi Step 12)

Implementato: auth (email+Google), RLS su 24/24 tabelle, food cost engine + UI, booking flow completo, Stripe Connect (onboarding chef) + Checkout (abbonamenti) + webhook, analytics dashboard, recensioni, Agent Orchestrator con 3 agenti attivi (Chef Assistant, Food Cost Analyst, Booking Assistant), CI GitHub Actions, E2E skeleton Playwright, SEO (sitemap/robots).

Non implementato — Phase 2/3 per scelta (Step 2, non per dimenticanza): Zero Waste AI, Academy/LMS, CRM dashboard, Social Media AI Studio, gli altri 7 AI agent, HACCP module. Vedi VERIFICATION.md per cosa è stato verificato per davvero vs cosa richiede il tuo ambiente di sviluppo.
