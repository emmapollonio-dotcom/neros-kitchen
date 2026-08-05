import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:onesignal_flutter/onesignal_flutter.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'app.dart';
import 'core/notifications/onesignal_auth_bridge.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Necessario prima di usare DateFormat con locale esplicito ('it_IT' in
  // BookingsScreen): senza questa chiamata intl lancia LocaleDataException
  // al primo utilizzo.
  await initializeDateFormatting();

  await Supabase.initialize(
    url: const String.fromEnvironment('SUPABASE_URL'),
    // supabase_flutter 2.17+: `anonKey` è deprecato a favore di `publishableKey`,
    // ma il valore accettato resta la stessa chiave (anon key del progetto).
    publishableKey: const String.fromEnvironment('SUPABASE_ANON_KEY'),
  );

  // Notifiche push (stato prenotazioni, vedi Edge Function
  // booking-status-notify). No-op se ONESIGNAL_APP_ID non è passato come
  // --dart-define: finché l'account OneSignal non è configurato (vedi
  // NOTIFICHE-PUSH-SETUP.md), l'app funziona normalmente senza push.
  const oneSignalAppId = String.fromEnvironment('ONESIGNAL_APP_ID');
  if (oneSignalAppId.isNotEmpty) {
    OneSignal.initialize(oneSignalAppId);
    OneSignal.Notifications.requestPermission(true);
    wireOneSignalToAuth();
  }

  runApp(const ProviderScope(child: NskApp()));
}
