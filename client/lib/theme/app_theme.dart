import 'package:flutter/material.dart';

class AppTheme {
  // Brand Colors inspired by Sri Lanka's Emerald Landscapes & Cultural Heritage
  static const Color primary = Color(0xFF0D5C46); // Deep Ceylon Emerald
  static const Color primaryLight = Color(0xFF1B8A6B);
  static const Color primaryDark = Color(0xFF083C2D);
  static const Color accent = Color(0xFFE67E22); // Sigiriya Ochre / Amber
  static const Color accentLight = Color(0xFFF39C12);
  static const Color background = Color(0xFFF7FAF8);
  static const Color surface = Colors.white;
  static const Color cardBg = Colors.white;
  static const Color textPrimary = Color(0xFF1E293B);
  static const Color textSecondary = Color(0xFF64748B);
  static const Color textMuted = Color(0xFF94A3B8);
  static const Color dividerColor = Color(0xFFE2E8F0);

  // Status & AI Colors
  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color error = Color(0xFFEF4444);
  static const Color xaiBadgeBg = Color(0xFFE8F5E9);
  static const Color xaiBadgeText = Color(0xFF1B5E20);
  static const Color alertCardBg = Color(0xFFFEF2F2);
  static const Color alertCardBorder = Color(0xFFFECACA);
  static const Color alertCardText = Color(0xFF991B1B);

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: background,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primary,
        primary: primary,
        secondary: accent,
        surface: surface,
      ),
      fontFamily: 'Roboto',
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 1,
        centerTitle: false,
        iconTheme: IconThemeData(color: textPrimary),
        titleTextStyle: TextStyle(
          color: textPrimary,
          fontSize: 18,
          fontWeight: FontWeight.w700,
          letterSpacing: -0.3,
        ),
      ),
      cardTheme: CardThemeData(
        color: cardBg,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: dividerColor, width: 1),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: Colors.white,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w600,
            letterSpacing: 0.2,
          ),
        ),
      ),
    );
  }
}
