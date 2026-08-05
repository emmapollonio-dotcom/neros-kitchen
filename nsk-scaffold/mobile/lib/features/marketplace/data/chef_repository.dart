import 'dart:convert';

import 'package:drift/drift.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../core/database/app_database.dart';
import '../domain/chef.dart';

class ChefRepository {
  ChefRepository(this._db);
  final AppDatabase _db;
  final SupabaseClient _client = Supabase.instance.client;

  /// Offline-first: legge dalla view pubblica v_chef_public_profile
  /// (RLS-safe), aggiorna la cache locale in caso di successo. Se la rete
  /// non è raggiungibile, torna l'ultima copia salvata in locale invece di
  /// propagare l'errore.
  Future<List<Chef>> searchChefs({String? city, String? cuisine}) async {
    try {
      final res = await _client
          .from('v_chef_public_profile')
          .select()
          .order('rating_avg', ascending: false)
          .limit(50);

      final rows = (res as List).cast<Map<String, dynamic>>();
      await _cacheChefs(rows);

      return rows.map(Chef.fromJson).toList();
    } catch (_) {
      return _readCachedChefs();
    }
  }

  Future<void> _cacheChefs(List<Map<String, dynamic>> rows) async {
    await _db.batch((batch) {
      batch.deleteAll(_db.cachedChefs);
      batch.insertAll(
        _db.cachedChefs,
        rows.map(
          (row) => CachedChefsCompanion.insert(
            id: row['id'] as String,
            fullName: row['full_name'] as String? ?? '',
            businessName: Value(row['business_name'] as String?),
            ratingAvg: (row['rating_avg'] as num?)?.toDouble() ?? 0,
            ratingCount: (row['rating_count'] as num?)?.toInt() ?? 0,
            languagesJson: jsonEncode((row['languages'] as List?)?.cast<String>() ?? const []),
            cachedAt: DateTime.now(),
          ),
        ),
      );
    });
  }

  Future<List<Chef>> _readCachedChefs() async {
    final cached = await _db.select(_db.cachedChefs).get();
    cached.sort((a, b) => b.ratingAvg.compareTo(a.ratingAvg));

    return cached
        .map(
          (row) => Chef(
            id: row.id,
            fullName: row.fullName,
            businessName: row.businessName,
            ratingAvg: row.ratingAvg,
            ratingCount: row.ratingCount,
            languages: (jsonDecode(row.languagesJson) as List).cast<String>(),
          ),
        )
        .toList();
  }
}
