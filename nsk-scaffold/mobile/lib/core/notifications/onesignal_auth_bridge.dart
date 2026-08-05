import 'package:onesignal_flutter/onesignal_flutter.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

/// Collega l'utente Supabase autenticato all'"External ID" di OneSignal, così
/// il backend può inviare una push mirata a un utente specifico (vedi Edge
/// Function booking-status-notify) senza dover gestire noi stessi i device
/// token. Va chiamata una sola volta da main.dart, subito dopo
/// Supabase.initialize() e OneSignal.initialize() — resta attiva per tutta
/// la vita dell'app, non serve annullare la sottoscrizione.
void wireOneSignalToAuth() {
  final client = Supabase.instance.client;

  // Copre anche il caso di sessione già presente al riavvio dell'app: senza
  // questa chiamata iniziale, un utente che riapre l'app da loggato (senza
  // un nuovo evento signedIn) non verrebbe mai ri-collegato a OneSignal dopo
  // un cold start del dispositivo.
  final currentUser = client.auth.currentUser;
  if (currentUser != null) {
    OneSignal.login(currentUser.id);
  }

  client.auth.onAuthStateChange.listen((data) {
    switch (data.event) {
      case AuthChangeEvent.signedIn:
      case AuthChangeEvent.tokenRefreshed:
        final user = data.session?.user;
        if (user != null) OneSignal.login(user.id);
        break;
      case AuthChangeEvent.signedOut:
        OneSignal.logout();
        break;
      default:
        break;
    }
  });
}
