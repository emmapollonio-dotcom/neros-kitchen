import 'package:flutter_test/flutter_test.dart';
import 'package:nsk_mobile/features/zero_waste/domain/waste_item.dart';

void main() {
  group('WasteItem.fromJson', () {
    test('legge correttamente un record completo dalla tabella waste_items', () {
      final json = {
        'id': 'uuid-1',
        'ingredient_name': 'Pomodori',
        'quantity': 2.5,
        'unit': 'kg',
        'reason': 'scaduti',
        'logged_at': '2026-08-05T10:00:00.000Z',
      };

      final item = WasteItem.fromJson(json);

      expect(item.id, 'uuid-1');
      expect(item.ingredientName, 'Pomodori');
      expect(item.quantity, 2.5);
      expect(item.unit, 'kg');
      expect(item.reason, 'scaduti');
      expect(item.loggedAt, DateTime.parse('2026-08-05T10:00:00.000Z'));
    });

    test('gestisce reason mancante e quantity intera con default sicuri', () {
      final json = {
        'id': 'uuid-2',
        'ingredient_name': 'Pane',
        'quantity': 1,
        'unit': 'kg',
        'logged_at': '2026-08-05T11:00:00.000Z',
      };

      final item = WasteItem.fromJson(json);

      expect(item.reason, isNull);
      expect(item.quantity, 1.0);
    });
  });
}
