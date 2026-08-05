import 'package:drift/drift.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../database/app_database.dart';
import '../database/database_provider.dart';

/// Svuota la coda di scritture Zero Waste create offline verso Supabase.
/// Chiamato da HomeShell quando la connettività torna disponibile (vedi
/// ref.listen su isOnlineProvider) e ad ogni apertura della schermata Zero
/// Waste, così l'utente non deve fare nulla di manuale per sincronizzare.
class SyncService {
  SyncService(this._db);
  final AppDatabase _db;

  Future<void> flushPendingWasteItems() async {
    final client = Supabase.instance.client;
    final userId = client.auth.currentUser?.id;
    if (userId == null) return;

    final pending = await (_db.select(_db.cachedWasteItems)
          ..where((t) => t.synced.equals(false)))
        .get();

    for (final row in pending) {
      try {
        final inserted = await client
            .from('waste_items')
            .insert({
              'user_id': userId,
              'ingredient_name': row.ingredientName,
              'quantity': row.quantity,
              'unit': row.unit,
              'reason': row.reason,
            })
            .select()
            .single();

        await (_db.update(_db.cachedWasteItems)
              ..where((t) => t.localId.equals(row.localId)))
            .write(
          CachedWasteItemsCompanion(
            remoteId: Value(inserted['id'] as String),
            synced: const Value(true),
          ),
        );
      } catch (_) {
        // Resta in coda (synced=false): si riproverà al prossimo giro di
        // connettività o alla prossima apertura di Zero Waste. Un singolo
        // item fallito non deve bloccare gli altri nella coda.
        continue;
      }
    }
  }
}

final syncServiceProvider = Provider<SyncService>((ref) {
  return SyncService(ref.watch(appDatabaseProvider));
});
