import 'package:flutter_test/flutter_test.dart';
import 'package:nsk_mobile/features/marketplace/domain/chef.dart';

void main() {
  group('Chef.fromJson', () {
    test('legge correttamente un record completo dalla view v_chef_public_profile', () {
      final json = {
        'id': 'uuid-1',
        'full_name': 'Mario Rossi',
        'business_name': 'Mario Rossi Chef',
        'rating_avg': 4.8,
        'rating_count': 12,
        'languages': ['it', 'en'],
      };

      final chef = Chef.fromJson(json);

      expect(chef.id, 'uuid-1');
      expect(chef.businessName, 'Mario Rossi Chef');
      expect(chef.ratingAvg, 4.8);
      expect(chef.ratingCount, 12);
      expect(chef.languages, ['it', 'en']);
    });

    test('gestisce campi mancanti/null con default sicuri (no crash)', () {
      final json = {'id': 'uuid-2', 'full_name': 'Chef Senza Rating'};

      final chef = Chef.fromJson(json);

      expect(chef.id, 'uuid-2');
      expect(chef.businessName, isNull);
      expect(chef.ratingAvg, 0);
      expect(chef.ratingCount, 0);
      expect(chef.languages, isEmpty);
    });
  });
}
