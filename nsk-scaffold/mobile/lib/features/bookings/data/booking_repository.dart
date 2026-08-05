import 'package:supabase_flutter/supabase_flutter.dart';
import '../domain/booking.dart';

class BookingRepository {
  final SupabaseClient _client = Supabase.instance.client;

  /// RLS "bookings_participants" filtra già a customer_id/chef_id =
  /// auth.uid(): qui non serve un .eq esplicito, come nelle route API web
  /// equivalenti (RLS resta l'unica fonte di verità sui permessi).
  Future<List<Booking>> myBookings() async {
    final res = await _client
        .from('bookings')
        .select()
        .order('event_date', ascending: false);

    return (res as List).map((row) => Booking.fromJson(row)).toList();
  }
}
