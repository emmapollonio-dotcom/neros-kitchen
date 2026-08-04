class Chef {
  final String id;
  final String fullName;
  final String? businessName;
  final double ratingAvg;
  final int ratingCount;
  final List<String> languages;

  Chef({
    required this.id,
    required this.fullName,
    this.businessName,
    required this.ratingAvg,
    required this.ratingCount,
    required this.languages,
  });

  factory Chef.fromJson(Map<String, dynamic> json) => Chef(
        id: json['id'] as String,
        fullName: json['full_name'] as String? ?? '',
        businessName: json['business_name'] as String?,
        ratingAvg: (json['rating_avg'] as num?)?.toDouble() ?? 0,
        ratingCount: (json['rating_count'] as num?)?.toInt() ?? 0,
        languages: (json['languages'] as List?)?.cast<String>() ?? const [],
      );
}
