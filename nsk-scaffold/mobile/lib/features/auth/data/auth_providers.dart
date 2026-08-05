import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

/// Stream degli eventi di autenticazione Supabase (login/logout/refresh token).
/// Usato dal router per decidere se reindirizzare a /login (vedi app.dart).
final authStateChangeProvider = StreamProvider<AuthState>((ref) {
  return Supabase.instance.client.auth.onAuthStateChange;
});

/// Utente corrente, derivato dallo stream sopra con fallback sulla sessione
/// già in memoria (utile al primissimo build, prima che lo stream emetta).
final currentUserProvider = Provider<User?>((ref) {
  final authState = ref.watch(authStateChangeProvider);
  return authState.maybeWhen(
    data: (state) => state.session?.user,
    orElse: () => Supabase.instance.client.auth.currentUser,
  );
});
