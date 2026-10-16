import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class RouteMapPreview extends StatelessWidget {
  const RouteMapPreview({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 180,
      width: double.infinity,
      decoration: BoxDecoration(
        color: const Color(0xFFE8F1EC),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.dividerColor),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: Stack(
          children: [
            CustomPaint(
              size: const Size(double.infinity, 180),
              painter: _MapCanvasPainter(),
            ),
            // Map Labels & Overlays
            Positioned(
              top: 12,
              left: 14,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.92),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.06),
                      blurRadius: 6,
                    ),
                  ],
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.map_outlined, size: 14, color: AppTheme.primary),
                    SizedBox(width: 5),
                    Text(
                      'Cultural Triangle Circuit • 48 km',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            // Live GPS Status Indicator
            Positioned(
              bottom: 12,
              right: 14,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: AppTheme.primaryDark,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.gps_fixed, size: 12, color: Colors.greenAccent),
                    SizedBox(width: 5),
                    Text(
                      'GPS: Sigiriya (87% Enjoyment Match)',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w500,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MapCanvasPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final bgPaint = Paint()..color = const Color(0xFFDCECE4);
    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height), bgPaint);

    // Grid lines to look like an authentic terrain map
    final gridPaint = Paint()
      ..color = const Color(0xFFC7DFD3)
      ..strokeWidth = 1.0;
    for (double i = 0; i < size.width; i += 35) {
      canvas.drawLine(Offset(i, 0), Offset(i, size.height), gridPaint);
    }
    for (double i = 0; i < size.height; i += 35) {
      canvas.drawLine(Offset(0, i), Offset(size.width, i), gridPaint);
    }

    // Lake / Tank (Minneriya / Kandalama Reservoir)
    final waterPaint = Paint()..color = const Color(0xFFBCE0FD);
    final waterPath = Path()
      ..moveTo(size.width * 0.72, size.height * 0.25)
      ..quadraticBezierTo(size.width * 0.85, size.height * 0.15, size.width * 0.95, size.height * 0.35)
      ..quadraticBezierTo(size.width * 0.88, size.height * 0.65, size.width * 0.75, size.height * 0.55)
      ..close();
    canvas.drawPath(waterPath, waterPaint);

    // Route Path
    final routePaint = Paint()
      ..color = AppTheme.primary
      ..strokeWidth = 3.5
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final p1 = Offset(size.width * 0.22, size.height * 0.68); // Sigiriya
    final p2 = Offset(size.width * 0.48, size.height * 0.42); // Lunch / Habarana
    final p3 = Offset(size.width * 0.78, size.height * 0.35); // Minneriya

    final path = Path()
      ..moveTo(p1.dx, p1.dy)
      ..quadraticBezierTo(size.width * 0.32, size.height * 0.45, p2.dx, p2.dy)
      ..quadraticBezierTo(size.width * 0.65, size.height * 0.48, p3.dx, p3.dy);

    canvas.drawPath(path, routePaint);

    // Pin 1: Sigiriya (Active)
    _drawPin(canvas, p1, '1', AppTheme.primary, true);
    // Pin 2: Traditional Lunch
    _drawPin(canvas, p2, '2', AppTheme.accent, false);
    // Pin 3: Minneriya Safari
    _drawPin(canvas, p3, '3', const Color(0xFF2E7D32), false);
  }

  void _drawPin(Canvas canvas, Offset offset, String label, Color color, bool isActive) {
    if (isActive) {
      final pulsePaint = Paint()
        ..color = color.withOpacity(0.25)
        ..style = PaintingStyle.fill;
      canvas.drawCircle(offset, 16, pulsePaint);
    }

    final pinPaint = Paint()..color = color;
    canvas.drawCircle(offset, 10, pinPaint);

    final whiteCenter = Paint()..color = Colors.white;
    canvas.drawCircle(offset, 7, whiteCenter);

    final textPainter = TextPainter(
      text: TextSpan(
        text: label,
        style: TextStyle(
          color: color,
          fontSize: 9,
          fontWeight: FontWeight.bold,
        ),
      ),
      textDirection: TextDirection.ltr,
    )..layout();

    textPainter.paint(
      canvas,
      Offset(offset.dx - textPainter.width / 2, offset.dy - textPainter.height / 2),
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
