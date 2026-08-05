import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// connectivity_plus 6.x emette una List<ConnectivityResult> (un device può
/// avere più interfacce attive contemporaneamente, es. wifi+cellulare):
/// consideriamo "online" se almeno una non è "none".
final connectivityStreamProvider = StreamProvider<bool>((ref) {
  return Connectivity()
      .onConnectivityChanged
      .map((results) => !results.every((r) => r == ConnectivityResult.none));
});

/// True di default finché il primo evento di connectivity_plus non arriva,
/// per non mostrare un banner "offline" scorretto all'avvio dell'app.
final isOnlineProvider = Provider<bool>((ref) {
  return ref.watch(connectivityStreamProvider).valueOrNull ?? true;
});
