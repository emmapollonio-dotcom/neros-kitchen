import 'dart:async';
import 'package:flutter/foundation.dart';

/// Adatta uno Stream (qui: gli auth state change di Supabase) al
/// Listenable richiesto da GoRouter.refreshListenable, così che il router
/// rivaluti automaticamente `redirect` a ogni login/logout, senza dover
/// gestire manualmente la navigazione da ogni schermata di auth.
class GoRouterRefreshStream extends ChangeNotifier {
  GoRouterRefreshStream(Stream<dynamic> stream) {
    notifyListeners();
    _subscription = stream.asBroadcastStream().listen((_) => notifyListeners());
  }

  late final StreamSubscription<dynamic> _subscription;

  @override
  void dispose() {
    _subscription.cancel();
    super.dispose();
  }
}
