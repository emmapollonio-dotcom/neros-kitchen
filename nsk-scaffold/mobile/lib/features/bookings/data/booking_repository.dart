import 'package:drift/drift.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../core/database/app_database.dart';
import '../domain/booking.dart';

class BookingRepository {
  BookingRepository(this._db);
  final AppDatabase _db;
  final SupabaseClient _client = Supabase.instance.client;

  /// Offline-first, stesso pattern di ChefRepository.searchChefs. RLS
  /// "bookings_participants" filtra già a customer_id/chef_id = auth.uid():
  /// qui non serve un .eq esplicito.
  Future<List<Booking>> myBookings() async {
    try {
      final res = await _client.from('bookings').select().order('event_date', ascending: false);

      final rows = (res as List).cast<Map<String, dynamic>>();
      await _cacheBookings(rows);

      return rows.map(Booking.fromJson).toList();
    } catch (_) {
      return _readCachedBookings();
    }
  }

  Future<void> _cacheBookings(List<Map<String, dynamic>> rows) async {
    await _db.batch((batch) {
      batch.deleteAll(_db.cachedBookings);
      batch.insertAll(
        _db.cachedBookings,
        rows.map(
          (row) => CachedBookingsCompanion.insert(
            id: row['id'] as String,
            chefId: row['chef_id'] as String,
            status: row['status'] as String? ?? 'requested',
            eventType: Value(row['event_type'] as String?),
            eventDate: DateTime.parse(row['event_date'] as String),
            guestCount: Value((row['guest_count'] as num?)?.toInt()),
            quoteAmount: Value((row['quote_amount'] as num?)?.toDouble()),
            currency: row['currency'] as String? ?? 'EUR',
            cachedAt: DateTime.now(),
          ),
        ),
      );
    });
  }

  Future<List<Booking>> _readCachedBookings() async {
    final cached = await _db.select(_db.cachedBookings).get();
    cached.sort((a, b) => b.eventDate.compareTo(a.eventDate));

    return cached
        .map(
          (row) => Booking(
            id: row.id,
            chefId: row.chefId,
            status: row.status,
            eventType: row.eventType,
            eventDate: row.eventDate,
            guestCount: row.guestCount,
            quoteAmount: row.quoteAmount,
            currency: row.currency,
          ),
        )
        .toList();
  }
}
