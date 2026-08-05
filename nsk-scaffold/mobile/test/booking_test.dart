import 'package:flutter_test/flutter_test.dart';
import 'package:nsk_mobile/features/bookings/domain/booking.dart';

void main() {
  group('Booking.fromJson', () {
    test('legge correttamente un record completo dalla tabella bookings', () {
      final json = {
        'id': 'uuid-1',
        'chef_id': 'chef-uuid-1',
        'status': 'confirmed',
        'event_type': 'Cena privata',
        'event_date': '2026-09-12T19:00:00.000Z',
        'guest_count': 8,
        'quote_amount': 450.0,
        'currency': 'EUR',
      };

      final booking = Booking.fromJson(json);

      expect(booking.id, 'uuid-1');
      expect(booking.status, 'confirmed');
      expect(booking.eventType, 'Cena privata');
      expect(booking.guestCount, 8);
      expect(booking.quoteAmount, 450.0);
      expect(booking.eventDate, DateTime.parse('2026-09-12T19:00:00.000Z'));
    });

    test('gestisce campi opzionali mancanti con default sicuri', () {
      final json = {
        'id': 'uuid-2',
        'chef_id': 'chef-uuid-2',
        'event_date': '2026-10-01T18:00:00.000Z',
      };

      final booking = Booking.fromJson(json);

      expect(booking.status, 'requested');
      expect(booking.eventType, isNull);
      expect(booking.guestCount, isNull);
      expect(booking.quoteAmount, isNull);
      expect(booking.currency, 'EUR');
    });
  });

  test('bookingStatusLabels copre tutti e 7 gli stadi di booking_status', () {
    expect(bookingStatusLabels.keys, containsAll(<String>[
      'requested',
      'quoted',
      'confirmed',
      'in_progress',
      'completed',
      'cancelled',
      'disputed',
    ]));
  });
}
