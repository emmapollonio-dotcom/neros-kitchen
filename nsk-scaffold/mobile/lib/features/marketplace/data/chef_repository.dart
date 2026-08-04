import 'package:supabase_flutter/supabase_flutter.dart';
import '../domain/chef.dart';

class ChefRepository {
  final SupabaseClient _client = Supabase.instance.client;

  /// Legge dalla view pubblica v_chef_public_profile (RLS-safe, nessun dato sensibile).
  Future<List<Chef>> searchChefs({String? city, String? cuisine}) async {
    final res = await _client
        .from('v_chef_public_profile')
        .select()
        .order('rating_avg', ascending: false)
        .limit(50);

    return (res as List).map((row) => Chef.fromJson(row)).toList();
  }
}
