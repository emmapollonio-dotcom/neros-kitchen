/// Rispecchia public.waste_items (supabase/schema.sql): id, user_id,
/// ingredient_name, quantity, unit, reason, image_url, logged_at.
class WasteItem {
  final String id;
  final String ingredientName;
  final double quantity;
  final String unit;
  final String? reason;
  final DateTime loggedAt;

  WasteItem({
    required this.id,
    required this.ingredientName,
    required this.quantity,
    required this.unit,
    this.reason,
    required this.loggedAt,
  });

  factory WasteItem.fromJson(Map<String, dynamic> json) => WasteItem(
        id: json['id'] as String,
        ingredientName: json['ingredient_name'] as String,
        quantity: (json['quantity'] as num?)?.toDouble() ?? 0,
        unit: json['unit'] as String? ?? '',
        reason: json['reason'] as String?,
        loggedAt: DateTime.parse(json['logged_at'] as String),
      );
}
