import 'package:flutter/material.dart';

/// Design tokens N'sK — Luxury Minimalist.
/// Stessi valori del design system web (tailwind.config.ts) per coerenza cross-platform.
class NskColors {
  static const charcoal = Color(0xFF121212);
  static const ivory = Color(0xFFF5F1EA);
  static const gold = Color(0xFFC8A96B);
  static const smoke = Color(0xFF555555);
}

ThemeData buildNskTheme() {
  return ThemeData(
    useMaterial3: true,
    scaffoldBackgroundColor: NskColors.ivory,
    colorScheme: ColorScheme.fromSeed(
      seedColor: NskColors.gold,
      primary: NskColors.charcoal,
      secondary: NskColors.gold,
      surface: NskColors.ivory,
    ),
    textTheme: const TextTheme(
      displayLarge: TextStyle(
        fontFamily: 'PlayfairDisplay',
        color: NskColors.charcoal,
        fontWeight: FontWeight.w600,
      ),
      bodyMedium: TextStyle(
        fontFamily: 'Montserrat',
        color: NskColors.smoke,
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: NskColors.charcoal,
        foregroundColor: NskColors.ivory,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
      ),
    ),
  );
}
