import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'app_database.dart';

/// Istanza singola per tutta la vita dell'app: aprire più connessioni allo
/// stesso file sqlite andrebbe evitato.
final appDatabaseProvider = Provider<AppDatabase>((ref) {
  final db = AppDatabase();
  ref.onDispose(db.close);
  return db;
});
