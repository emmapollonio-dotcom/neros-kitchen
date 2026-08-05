# N'sK Mobile

App Flutter (iOS/Android/Tablet) — marketplace chef, prenotazioni, Zero Waste, profilo. Vedi `../ARCHITETTURA.md` (se presente) o i commenti nei singoli file per il resto del contesto architetturale.

## Setup locale

```
flutter pub get
dart run build_runner build --delete-conflicting-outputs   # genera app_database.g.dart (drift) e i provider *.g.dart
```

## Variabili richieste (--dart-define)

L'app non legge un file `.env`: le variabili di configurazione vanno passate a `flutter run`/`flutter build` come `--dart-define`.

| Nome | Obbligatoria | Note |
|---|---|---|
| `SUPABASE_URL` | Sì | `https://xjvrhoweghzfvwjsvwla.supabase.co` |
| `SUPABASE_ANON_KEY` | Sì | vedi `../web/.env.example` |
| `ONESIGNAL_APP_ID` | No | notifiche push stato prenotazioni — vedi `../NOTIFICHE-PUSH-SETUP.md`. Senza, l'app funziona normalmente ma senza push. |

Esempio:
```
flutter run \
  --dart-define=SUPABASE_URL=https://xjvrhoweghzfvwjsvwla.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=<la anon key> \
  --dart-define=ONESIGNAL_APP_ID=<opzionale>
```

Per non doverle riscrivere ogni volta, puoi salvarle in un file locale (es. `dart_defines.json`, **da non committare**, già ignorato se lo chiami `*.local.json`) e passarlo con `--dart-define-from-file=dart_defines.json`.

## Verifica

```
flutter analyze
flutter test
```
