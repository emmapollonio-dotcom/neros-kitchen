/// Rispecchia public.bookings (supabase/schema.sql): customer_id, chef_id,
/// event_type, event_date, guest_count, location, status (enum
/// booking_status), quote_amount, currency, notes.
class Booking {
  final String id;
  final String chefId;
  final String status;
  final String? eventType;
  final DateTime eventDate;
  final int? guestCount;
  final double? quoteAmount;
  final String currency;

  Booking({
    required this.id,
    required this.chefId,
    required this.status,
    this.eventType,
    required this.eventDate,
    this.guestCount,
    this.quoteAmount,
    required this.currency,
  });

  factory Booking.fromJson(Map<String, dynamic> json) => Booking(
        id: json['id'] as String,
        chefId: json['chef_id'] as String,
        status: json['status'] as String? ?? 'requested',
        eventType: json['event_type'] as String?,
        eventDate: DateTime.parse(json['event_date'] as String),
        guestCount: (json['guest_count'] as num?)?.toInt(),
        quoteAmount: (json['quote_amount'] as num?)?.toDouble(),
        currency: json['currency'] as String? ?? 'EUR',
      );
}

/// Etichette in italiano per i 7 stadi di public.booking_status.
const Map<String, String> bookingStatusLabels = {
  'requested': 'Richiesta inviata',
  'quoted': 'Preventivo ricevuto',
  'confirmed': 'Confermata',
  'in_progress': 'In corso',
  'completed': 'Completata',
  'cancelled': 'Annullata',
  'disputed': 'In contestazione',
};
