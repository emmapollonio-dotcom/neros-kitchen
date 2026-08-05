import 'package:flutter_test/flutter_test.dart';
import 'package:nsk_mobile/features/bookings/domain/booking.dart';
import 'package:nsk_mobile/features/bookings/presentation/bookings_screen.dart';
import 'package:nsk_mobile/l10n/generated/app_localizations_en.dart';

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

  test('bookingStatusLabel copre tutti e 7 gli stadi di booking_status', () {
    final l10n = AppLocalizationsEn();
    const statuses = [
      'requested',
      'quoted',
      'confirmed',
      'in_progress',
      'completed',
      'cancelled',
      'disputed',
    ];

    for (final status in statuses) {
      // Se lo stadio non è coperto, bookingStatusLabel torna lo status grezzo
      // invariato (vedi il default nello switch): un'etichetta tradotta deve
      // sempre differire dalla stringa tecnica del database.
      expect(bookingStatusLabel(l10n, status), isNot(equals(status)));
    }
  });
}
