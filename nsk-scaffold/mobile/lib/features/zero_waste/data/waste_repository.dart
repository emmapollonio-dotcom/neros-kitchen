import 'package:drift/drift.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../core/database/app_database.dart';
import '../domain/waste_item.dart';

class WasteRepository {
  WasteRepository(this._db);
  final AppDatabase _db;
  final SupabaseClient _client = Supabase.instance.client;

  /// Offline-first: prova la rete e aggiorna la cache (solo le righe già
  /// sincronizzate: quelle ancora in coda — synced=false — non vengono mai
  /// toccate da qui, solo da SyncService/logWaste). Se offline, legge dalla
  /// cache: include sia gli ultimi dati sincronizzati sia le voci create
  /// offline non ancora inviate, così l'utente le vede subito comunque.
  Future<List<WasteItem>> myWasteItems() async {
    try {
      final res = await _client
          .from('waste_items')
          .select()
          .order('logged_at', ascending: false)
          .limit(100);

      final rows = (res as List).cast<Map<String, dynamic>>();

      await _db.batch((batch) {
        batch.deleteWhere(_db.cachedWasteItems, (t) => t.synced.equals(true));
        batch.insertAll(
          _db.cachedWasteItems,
          rows.map(
            (row) => CachedWasteItemsCompanion.insert(
              remoteId: Value(row['id'] as String),
              ingredientName: row['ingredient_name'] as String,
              quantity: (row['quantity'] as num?)?.toDouble() ?? 0,
              unit: row['unit'] as String? ?? '',
              reason: Value(row['reason'] as String?),
              loggedAt: DateTime.parse(row['logged_at'] as String),
              synced: const Value(true),
            ),
          ),
        );
      });

      return rows.map(WasteItem.fromJson).toList();
    } catch (_) {
      final cached = await _db.select(_db.cachedWasteItems).get();
      cached.sort((a, b) => b.loggedAt.compareTo(a.loggedAt));

      return cached
          .map(
            (row) => WasteItem(
              id: row.remoteId ?? 'local-${row.localId}',
              ingredientName: row.ingredientName,
              quantity: row.quantity,
              unit: row.unit,
              reason: row.reason,
              loggedAt: row.loggedAt,
            ),
          )
          .toList();
    }
  }

  /// Scrive sempre prima in locale (synced=false), così l'utente la vede
  /// subito anche offline, poi prova a inviarla immediatamente a Supabase.
  /// Se il tentativo immediato fallisce (offline o errore di rete), la riga
  /// resta in coda: verrà ritentata da SyncService al ritorno della
  /// connettività, senza bisogno di nessuna azione manuale dell'utente.
  Future<void> logWaste({
    required String ingredientName,
    required double quantity,
    required String unit,
    String? reason,
  }) async {
    final loggedAt = DateTime.now();

    final localId = await _db.into(_db.cachedWasteItems).insert(
          CachedWasteItemsCompanion.insert(
            ingredientName: ingredientName,
            quantity: quantity,
            unit: unit,
            reason: Value(reason),
            loggedAt: loggedAt,
            synced: const Value(false),
          ),
        );

    try {
      final userId = _client.auth.currentUser!.id;
      final inserted = await _client
          .from('waste_items')
          .insert({
            'user_id': userId,
            'ingredient_name': ingredientName,
            'quantity': quantity,
            'unit': unit,
            'reason': reason,
          })
          .select()
          .single();

      await (_db.update(_db.cachedWasteItems)..where((t) => t.localId.equals(localId))).write(
        CachedWasteItemsCompanion(
          remoteId: Value(inserted['id'] as String),
          synced: const Value(true),
        ),
      );
    } catch (_) {
      // Offline o errore di rete: resta in coda, la riprova SyncService.
    }
  }
}
