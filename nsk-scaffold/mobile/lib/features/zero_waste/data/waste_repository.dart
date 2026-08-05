import 'package:supabase_flutter/supabase_flutter.dart';
import '../domain/waste_item.dart';

class WasteRepository {
  final SupabaseClient _client = Supabase.instance.client;

  /// RLS "waste_items_owner" filtra già a user_id = auth.uid().
  Future<List<WasteItem>> myWasteItems() async {
    final res = await _client
        .from('waste_items')
        .select()
        .order('logged_at', ascending: false)
        .limit(100);

    return (res as List).map((row) => WasteItem.fromJson(row)).toList();
  }

  Future<void> logWaste({
    required String ingredientName,
    required double quantity,
    required String unit,
    String? reason,
  }) async {
    await _client.from('waste_items').insert({
      'user_id': _client.auth.currentUser!.id,
      'ingredient_name': ingredientName,
      'quantity': quantity,
      'unit': unit,
      'reason': reason,
    });
  }
}
