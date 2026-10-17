import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class RouteMapPreview extends StatefulWidget {
  const RouteMapPreview({super.key});

  @override
  State<RouteMapPreview> createState() => _RouteMapPreviewState();
}

class _RouteMapPreviewState extends State<RouteMapPreview>
    with SingleTickerProviderStateMixin {
  int _selectedPinIndex = 0; // 0: Sigiriya, 1: Habarana, 2: Minneriya
  bool _isSatellite = false;
  double _zoomScale = 1.0;
  late AnimationController _pulseController;

  final List<MapWaypoint> _waypoints = const [
    MapWaypoint(
      id: 1,
      title: 'Sigiriya Rock Fortress',
      category: 'World Heritage Site',
      time: '08:30 AM',
      duration: '2h 30m',
      icon: Icons.castle_rounded,
      color: AppTheme.primary,
      xPercent: 0.18,
      yPercent: 0.70,
      highlights: 'UNESCO Site • 1,200 Steps • 98% Match',
    ),
    MapWaypoint(
      id: 2,
      title: 'Habarana Village Lunch',
      category: 'Culinary & Culture',
      time: '12:45 PM',
      duration: '1h 15m',
      icon: Icons.restaurant_rounded,
      color: AppTheme.accent,
      xPercent: 0.50,
      yPercent: 0.45,
      highlights: 'Authentic Rice & Curry • Highly Rated',
    ),
    MapWaypoint(
      id: 3,
      title: 'Minneriya National Park',
      category: 'Wildlife Safari',
      time: '03:15 PM',
      duration: '3h 00m',
      icon: Icons.pets_rounded,
      color: Color(0xFF1B7A43),
      xPercent: 0.82,
      yPercent: 0.32,
      highlights: 'The Elephant Gathering • 4x4 Jeep Tour',
    ),
  ];

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1800),
    )..repeat();
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  void _onPinTap(int index) {
    setState(() {
      _selectedPinIndex = index;
    });
  }

  void _toggleMapStyle() {
    setState(() {
      _isSatellite = !_isSatellite;
    });
  }

  void _zoomIn() {
    setState(() {
      _zoomScale = (_zoomScale + 0.15).clamp(0.9, 1.45);
    });
  }

  void _zoomOut() {
    setState(() {
      _zoomScale = (_zoomScale - 0.15).clamp(0.9, 1.45);
    });
  }

  @override
  Widget build(BuildContext context) {
    final activeWaypoint = _waypoints[_selectedPinIndex];

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: _isSatellite ? const Color(0xFF1C2B22) : const Color(0xFFF0F5F2),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: _isSatellite
              ? Colors.white.withValues(alpha: 0.15)
              : AppTheme.dividerColor,
          width: 1.2,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 18,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: Column(
          children: [
            // Top Canvas Area
            SizedBox(
              height: 220,
              child: Stack(
                children: [
                  // Interactive Map Canvas
                  AnimatedBuilder(
                    animation: _pulseController,
                    builder: (context, child) {
                      return CustomPaint(
                        size: const Size(double.infinity, 220),
                        painter: _EnhancedMapCanvasPainter(
                          pulseValue: _pulseController.value,
                          isSatellite: _isSatellite,
                          zoomScale: _zoomScale,
                          selectedIndex: _selectedPinIndex,
                          waypoints: _waypoints,
                        ),
                      );
                    },
                  ),

                  // Clickable Invisible Pin Targets
                  LayoutBuilder(
                    builder: (context, constraints) {
                      final w = constraints.maxWidth;
                      final h = 220.0;
                      return Stack(
                        children: List.generate(_waypoints.length, (index) {
                          final wp = _waypoints[index];
                          // Normalized center
                          final cx = w * wp.xPercent;
                          final cy = h * wp.yPercent;

                          return Positioned(
                            left: cx - 28,
                            top: cy - 28,
                            child: GestureDetector(
                              onTap: () => _onPinTap(index),
                              behavior: HitTestBehavior.opaque,
                              child: Container(
                                width: 56,
                                height: 56,
                                color: Colors.transparent,
                              ),
                            ),
                          );
                        }),
                      );
                    },
                  ),

                  // Top Header Badge: Circuit Title & Distance
                  Positioned(
                    top: 12,
                    left: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 11,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: _isSatellite
                            ? const Color(0xFF1E293B).withValues(alpha: 0.88)
                            : Colors.white.withValues(alpha: 0.94),
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(
                          color: _isSatellite
                              ? Colors.white.withValues(alpha: 0.12)
                              : AppTheme.dividerColor,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.08),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(4),
                            decoration: BoxDecoration(
                              color: AppTheme.primary.withValues(alpha: 0.12),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.route_rounded,
                              size: 13,
                              color: AppTheme.primary,
                            ),
                          ),
                          const SizedBox(width: 7),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                'Cultural Triangle Circuit',
                                style: TextStyle(
                                  fontSize: 11.5,
                                  fontWeight: FontWeight.w700,
                                  color: _isSatellite
                                      ? Colors.white
                                      : AppTheme.textPrimary,
                                ),
                              ),
                              Row(
                                children: [
                                  Text(
                                    '48 km • 3 Optimal Waypoints',
                                    style: TextStyle(
                                      fontSize: 9.5,
                                      fontWeight: FontWeight.w500,
                                      color: _isSatellite
                                          ? const Color(0xFF94A3B8)
                                          : AppTheme.textSecondary,
                                    ),
                                  ),
                                  const SizedBox(width: 4),
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 4,
                                      vertical: 1,
                                    ),
                                    decoration: BoxDecoration(
                                      color: AppTheme.success.withValues(alpha: 0.15),
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: const Text(
                                      'DQN Optimal',
                                      style: TextStyle(
                                        fontSize: 8,
                                        fontWeight: FontWeight.w700,
                                        color: AppTheme.success,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),

                  // Top Right Control Panel: Map Type Toggle, Zoom +/- & Compass
                  Positioned(
                    top: 12,
                    right: 12,
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Map Style Switch (Terrain vs Satellite)
                        InkWell(
                          onTap: _toggleMapStyle,
                          borderRadius: BorderRadius.circular(20),
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 5,
                            ),
                            decoration: BoxDecoration(
                              color: _isSatellite
                                  ? const Color(0xFF0F172A).withValues(alpha: 0.9)
                                  : Colors.white.withValues(alpha: 0.92),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                color: _isSatellite
                                    ? Colors.white.withValues(alpha: 0.2)
                                    : AppTheme.dividerColor,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.08),
                                  blurRadius: 6,
                                ),
                              ],
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  _isSatellite
                                      ? Icons.satellite_alt_rounded
                                      : Icons.terrain_rounded,
                                  size: 13,
                                  color: _isSatellite
                                      ? Colors.lightBlueAccent
                                      : AppTheme.primary,
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  _isSatellite ? 'Satellite' : 'Topography',
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w600,
                                    color: _isSatellite
                                        ? Colors.white
                                        : AppTheme.textPrimary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(width: 6),

                        // Zoom Controls
                        Container(
                          decoration: BoxDecoration(
                            color: _isSatellite
                                ? const Color(0xFF0F172A).withValues(alpha: 0.9)
                                : Colors.white.withValues(alpha: 0.92),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: _isSatellite
                                  ? Colors.white.withValues(alpha: 0.2)
                                  : AppTheme.dividerColor,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.08),
                                blurRadius: 6,
                              ),
                            ],
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              _buildMiniIconButton(
                                icon: Icons.add,
                                onTap: _zoomIn,
                                tooltip: 'Zoom In',
                              ),
                              Container(
                                height: 14,
                                width: 1,
                                color: AppTheme.dividerColor,
                              ),
                              _buildMiniIconButton(
                                icon: Icons.remove,
                                onTap: _zoomOut,
                                tooltip: 'Zoom Out',
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Bottom Left Scale & North Indicator
                  Positioned(
                    bottom: 10,
                    left: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 3,
                      ),
                      decoration: BoxDecoration(
                        color: _isSatellite
                            ? Colors.black.withValues(alpha: 0.6)
                            : Colors.white.withValues(alpha: 0.85),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.navigation_rounded,
                            size: 11,
                            color: _isSatellite ? Colors.redAccent : Colors.red,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            'N  |  0—10 km',
                            style: TextStyle(
                              fontSize: 9,
                              fontWeight: FontWeight.w600,
                              letterSpacing: 0.5,
                              color: _isSatellite
                                  ? Colors.white70
                                  : AppTheme.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  // Bottom Right Live GPS Match Indicator
                  Positioned(
                    bottom: 10,
                    right: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 5,
                      ),
                      decoration: BoxDecoration(
                        color: const Color(0xFF06281E).withValues(alpha: 0.92),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: AppTheme.primaryLight.withValues(alpha: 0.4),
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.15),
                            blurRadius: 8,
                          ),
                        ],
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 7,
                            height: 7,
                            decoration: const BoxDecoration(
                              color: Color(0xFF10B981),
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color: Color(0xFF10B981),
                                  blurRadius: 6,
                                  spreadRadius: 1,
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 6),
                          const Text(
                            'GPS Live: Sigiriya (87% Match)',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
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

            // Bottom Interactive Waypoint Summary Card (Updates on Pin Tap)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: _isSatellite ? const Color(0xFF131F17) : Colors.white,
                border: Border(
                  top: BorderSide(
                    color: _isSatellite
                        ? Colors.white.withValues(alpha: 0.1)
                        : AppTheme.dividerColor,
                  ),
                ),
              ),
              child: Row(
                children: [
                  // Waypoint Number Badge
                  Container(
                    width: 34,
                    height: 34,
                    decoration: BoxDecoration(
                      color: activeWaypoint.color.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: activeWaypoint.color.withValues(alpha: 0.4),
                      ),
                    ),
                    child: Center(
                      child: Icon(
                        activeWaypoint.icon,
                        size: 18,
                        color: activeWaypoint.color,
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),

                  // Stop Information
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(
                              'Stop ${activeWaypoint.id}: ${activeWaypoint.title}',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                color: _isSatellite
                                    ? Colors.white
                                    : AppTheme.textPrimary,
                              ),
                            ),
                            const Spacer(),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 6,
                                vertical: 2,
                              ),
                              decoration: BoxDecoration(
                                color: AppTheme.primary.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                activeWaypoint.time,
                                style: const TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w700,
                                  color: AppTheme.primary,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 2),
                        Row(
                          children: [
                            Text(
                              activeWaypoint.category,
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w500,
                                color: _isSatellite
                                    ? const Color(0xFF94A3B8)
                                    : AppTheme.textSecondary,
                              ),
                            ),
                            Text(
                              ' • Est. ${activeWaypoint.duration}',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w500,
                                color: _isSatellite
                                    ? const Color(0xFF94A3B8)
                                    : AppTheme.textSecondary,
                              ),
                            ),
                            const Spacer(),
                            Text(
                              'Tap pins to view',
                              style: TextStyle(
                                fontSize: 9,
                                fontStyle: FontStyle.italic,
                                color: _isSatellite
                                    ? const Color(0xFF64748B)
                                    : AppTheme.textMuted,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMiniIconButton({
    required IconData icon,
    required VoidCallback onTap,
    required String tooltip,
  }) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.all(5),
        child: Icon(
          icon,
          size: 14,
          color: _isSatellite ? Colors.white : AppTheme.textPrimary,
        ),
      ),
    );
  }
}

class MapWaypoint {
  final int id;
  final String title;
  final String category;
  final String time;
  final String duration;
  final IconData icon;
  final Color color;
  final double xPercent;
  final double yPercent;
  final String highlights;

  const MapWaypoint({
    required this.id,
    required this.title,
    required this.category,
    required this.time,
    required this.duration,
    required this.icon,
    required this.color,
    required this.xPercent,
    required this.yPercent,
    required this.highlights,
  });
}

class _EnhancedMapCanvasPainter extends CustomPainter {
  final double pulseValue;
  final bool isSatellite;
  final double zoomScale;
  final int selectedIndex;
  final List<MapWaypoint> waypoints;

  _EnhancedMapCanvasPainter({
    required this.pulseValue,
    required this.isSatellite,
    required this.zoomScale,
    required this.selectedIndex,
    required this.waypoints,
  });

  @override
  void paint(Canvas canvas, Size size) {
    // Canvas background
    final bgPaint = Paint()
      ..color = isSatellite ? const Color(0xFF1E2F26) : const Color(0xFFEAF3ED);
    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height), bgPaint);

    // Apply zoom transformation centered on middle
    canvas.save();
    canvas.translate(size.width / 2, size.height / 2);
    canvas.scale(zoomScale);
    canvas.translate(-size.width / 2, -size.height / 2);

    // 1. Draw Organic Topographical Contours & Shaded Hills
    _drawTopographyContours(canvas, size);

    // 2. Draw Protected Forest Reserves (Minneriya & Hurulu Eco Park)
    _drawForestSanctuary(canvas, size);

    // 3. Draw Realistic Reservoirs & Water Bodies (Minneriya Lake & Kandalama Tank)
    _drawWaterBodies(canvas, size);

    // 4. Draw Sri Lanka Regional Road Network (A6, A11 Highways & Secondary paths)
    _drawRoadNetworks(canvas, size);

    // 5. Draw Optimized Multi-layer Route Corridor with Travel Direction Chevrons
    _drawOptimizedRoute(canvas, size);

    // 6. Draw Waypoint Pins, Badges, Labels & Pulsing Rings
    _drawWaypoints(canvas, size);

    canvas.restore();
  }

  void _drawTopographyContours(Canvas canvas, Size size) {
    final contourPaint = Paint()
      ..color = isSatellite
          ? const Color(0xFF283F34).withValues(alpha: 0.6)
          : const Color(0xFFD6E8DE).withValues(alpha: 0.8)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;

    // Draw realistic elevation isolines for the central plains & rock outcrops
    final path1 = Path()
      ..moveTo(size.width * -0.05, size.height * 0.85)
      ..cubicTo(size.width * 0.15, size.height * 0.60, size.width * 0.35, size.height * 0.90, size.width * 0.55, size.height * 0.75)
      ..cubicTo(size.width * 0.70, size.height * 0.65, size.width * 0.85, size.height * 0.80, size.width * 1.05, size.height * 0.60);
    canvas.drawPath(path1, contourPaint);

    final path2 = Path()
      ..moveTo(size.width * 0.05, size.height * 0.95)
      ..cubicTo(size.width * 0.20, size.height * 0.72, size.width * 0.38, size.height * 0.98, size.width * 0.60, size.height * 0.85);
    canvas.drawPath(path2, contourPaint);

    // Hill elevation ring around Sigiriya area
    final sigiriyaCenter = Offset(size.width * 0.18, size.height * 0.70);
    final hillFill = Paint()
      ..color = isSatellite
          ? const Color(0xFF22382C).withValues(alpha: 0.7)
          : const Color(0xFFDFECE3);
    canvas.drawOval(
      Rect.fromCenter(center: sigiriyaCenter, width: 80, height: 50),
      hillFill,
    );
    canvas.drawOval(
      Rect.fromCenter(center: sigiriyaCenter, width: 50, height: 32),
      contourPaint,
    );
  }

  void _drawForestSanctuary(Canvas canvas, Size size) {
    // Minneriya National Park Wildlife Sanctuary Polygon
    final forestPaint = Paint()
      ..color = isSatellite
          ? const Color(0xFF14241B)
          : const Color(0xFFDBEFE1)
      ..style = PaintingStyle.fill;

    final forestPath = Path()
      ..moveTo(size.width * 0.65, size.height * 0.08)
      ..quadraticBezierTo(size.width * 0.80, size.height * 0.02, size.width * 0.98, size.height * 0.10)
      ..quadraticBezierTo(size.width * 1.02, size.height * 0.45, size.width * 0.88, size.height * 0.58)
      ..quadraticBezierTo(size.width * 0.72, size.height * 0.52, size.width * 0.65, size.height * 0.30)
      ..close();

    canvas.drawPath(forestPath, forestPaint);

    // Subtle Forest Label
    final textPainter = TextPainter(
      text: TextSpan(
        text: 'MINNERIYA WILDLIFE SANCTUARY',
        style: TextStyle(
          color: isSatellite
              ? const Color(0xFF4E735D)
              : const Color(0xFF81AA91),
          fontSize: 7.5,
          fontWeight: FontWeight.w700,
          letterSpacing: 1.2,
        ),
      ),
      textDirection: TextDirection.ltr,
    )..layout();

    textPainter.paint(
      canvas,
      Offset(size.width * 0.68, size.height * 0.12),
    );
  }

  void _drawWaterBodies(Canvas canvas, Size size) {
    // Minneriya Tank (Minneriya Wewa Reservoir) - Natural organic shoreline
    final waterFill = Paint()
      ..color = isSatellite ? const Color(0xFF193D54) : const Color(0xFFAFE0FA)
      ..style = PaintingStyle.fill;

    final waterBorder = Paint()
      ..color = isSatellite ? const Color(0xFF265A7C) : const Color(0xFF86CAEE)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.2;

    final lakePath = Path()
      ..moveTo(size.width * 0.75, size.height * 0.22)
      ..cubicTo(size.width * 0.80, size.height * 0.15, size.width * 0.88, size.height * 0.16, size.width * 0.92, size.height * 0.24)
      ..cubicTo(size.width * 0.96, size.height * 0.32, size.width * 0.94, size.height * 0.44, size.width * 0.88, size.height * 0.46)
      ..cubicTo(size.width * 0.82, size.height * 0.48, size.width * 0.76, size.height * 0.40, size.width * 0.74, size.height * 0.32)
      ..close();

    canvas.drawPath(lakePath, waterFill);
    canvas.drawPath(lakePath, waterBorder);

    // Lake name annotation
    final lakeText = TextPainter(
      text: TextSpan(
        text: 'Minneriya Wewa',
        style: TextStyle(
          color: isSatellite ? const Color(0xFF64B5F6) : const Color(0xFF3888BA),
          fontSize: 8,
          fontStyle: FontStyle.italic,
          fontWeight: FontWeight.w600,
        ),
      ),
      textDirection: TextDirection.ltr,
    )..layout();

    lakeText.paint(
      canvas,
      Offset(size.width * 0.80, size.height * 0.30),
    );

    // Kandalama Tank (smaller reservoir bottom left)
    final kandalamaPath = Path()
      ..moveTo(size.width * 0.05, size.height * 0.80)
      ..quadraticBezierTo(size.width * 0.12, size.height * 0.78, size.width * 0.14, size.height * 0.88)
      ..quadraticBezierTo(size.width * 0.08, size.height * 0.95, size.width * 0.02, size.height * 0.90)
      ..close();
    canvas.drawPath(kandalamaPath, waterFill);
    canvas.drawPath(kandalamaPath, waterBorder);
  }

  void _drawRoadNetworks(Canvas canvas, Size size) {
    // Secondary Local Roads
    final secondaryRoadPaint = Paint()
      ..color = isSatellite ? const Color(0xFF2E3E34) : const Color(0xFFDCE6DF)
      ..strokeWidth = 2.0
      ..style = PaintingStyle.stroke;

    final roadPath1 = Path()
      ..moveTo(size.width * 0.0, size.height * 0.50)
      ..quadraticBezierTo(size.width * 0.25, size.height * 0.52, size.width * 0.45, size.height * 0.20);
    canvas.drawPath(roadPath1, secondaryRoadPaint);

    // Highway A6 (Ambepussa - Trincomalee)
    final highwayBorder = Paint()
      ..color = isSatellite ? const Color(0xFF3A4B40) : const Color(0xFFCADBD0)
      ..strokeWidth = 4.5
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final highwayFill = Paint()
      ..color = isSatellite ? const Color(0xFF4B5E52) : Colors.white
      ..strokeWidth = 2.8
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final hPath = Path()
      ..moveTo(size.width * 0.30, size.height * 0.95)
      ..cubicTo(size.width * 0.40, size.height * 0.70, size.width * 0.48, size.height * 0.46, size.width * 0.52, size.height * 0.25)
      ..cubicTo(size.width * 0.55, size.height * 0.10, size.width * 0.60, size.height * 0.0, size.width * 0.65, size.height * -0.1);

    canvas.drawPath(hPath, highwayBorder);
    canvas.drawPath(hPath, highwayFill);

    // Highway A11 (Habarana - Minneriya)
    final hPathA11 = Path()
      ..moveTo(size.width * 0.50, size.height * 0.45)
      ..cubicTo(size.width * 0.62, size.height * 0.44, size.width * 0.72, size.height * 0.38, size.width * 0.95, size.height * 0.48);

    canvas.drawPath(hPathA11, highwayBorder);
    canvas.drawPath(hPathA11, highwayFill);

    // Highway Road Shields ("A6" & "A11")
    _drawHighwayShield(canvas, Offset(size.width * 0.39, size.height * 0.75), 'A6');
    _drawHighwayShield(canvas, Offset(size.width * 0.65, size.height * 0.42), 'A11');
  }

  void _drawHighwayShield(Canvas canvas, Offset offset, String name) {
    final bgPaint = Paint()..color = isSatellite ? const Color(0xFF0F172A) : const Color(0xFF334155);
    final rect = RRect.fromRectAndRadius(
      Rect.fromCenter(center: offset, width: 20, height: 12),
      const Radius.circular(3),
    );
    canvas.drawRRect(rect, bgPaint);

    final text = TextPainter(
      text: TextSpan(
        text: name,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 7.5,
          fontWeight: FontWeight.bold,
        ),
      ),
      textDirection: TextDirection.ltr,
    )..layout();

    text.paint(
      canvas,
      Offset(offset.dx - text.width / 2, offset.dy - text.height / 2),
    );
  }

  void _drawOptimizedRoute(Canvas canvas, Size size) {
    final p1 = Offset(size.width * waypoints[0].xPercent, size.height * waypoints[0].yPercent); // Sigiriya
    final p2 = Offset(size.width * waypoints[1].xPercent, size.height * waypoints[1].yPercent); // Habarana
    final p3 = Offset(size.width * waypoints[2].xPercent, size.height * waypoints[2].yPercent); // Minneriya

    // Outer glow / shadow corridor
    final routeGlowPaint = Paint()
      ..color = AppTheme.primary.withValues(alpha: isSatellite ? 0.35 : 0.22)
      ..strokeWidth = 9.0
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    // Main emerald highway route
    final routeMainPaint = Paint()
      ..color = isSatellite ? const Color(0xFF10B981) : AppTheme.primary
      ..strokeWidth = 4.2
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    // Inner dashed guide line
    final routeDashPaint = Paint()
      ..color = Colors.white.withValues(alpha: 0.7)
      ..strokeWidth = 1.4
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    // Path Segment 1: Sigiriya -> Habarana
    final seg1 = Path()
      ..moveTo(p1.dx, p1.dy)
      ..cubicTo(
        size.width * 0.28, size.height * 0.58,
        size.width * 0.38, size.height * 0.52,
        p2.dx, p2.dy,
      );

    // Path Segment 2: Habarana -> Minneriya
    final seg2 = Path()
      ..moveTo(p2.dx, p2.dy)
      ..cubicTo(
        size.width * 0.60, size.height * 0.44,
        size.width * 0.70, size.height * 0.38,
        p3.dx, p3.dy,
      );

    canvas.drawPath(seg1, routeGlowPaint);
    canvas.drawPath(seg2, routeGlowPaint);

    canvas.drawPath(seg1, routeMainPaint);
    canvas.drawPath(seg2, routeMainPaint);

    // Draw dashed center lines
    _drawDashedPath(canvas, seg1, routeDashPaint, 6, 5);
    _drawDashedPath(canvas, seg2, routeDashPaint, 6, 5);

    // Segment Distance & Duration Badges
    _drawSegmentPill(
      canvas,
      Offset(size.width * 0.34, size.height * 0.56),
      '18 km • 35m',
    );

    _drawSegmentPill(
      canvas,
      Offset(size.width * 0.66, size.height * 0.41),
      '30 km • 1h 10m',
    );
  }

  void _drawDashedPath(
    Canvas canvas,
    Path path,
    Paint paint,
    double dashLength,
    double dashSpace,
  ) {
    for (final metric in path.computeMetrics()) {
      double start = 0.0;
      while (start < metric.length) {
        final end = math.min(start + dashLength, metric.length);
        canvas.drawPath(metric.extractPath(start, end), paint);
        start += dashLength + dashSpace;
      }
    }
  }

  void _drawSegmentPill(Canvas canvas, Offset center, String text) {
    final bgPaint = Paint()..color = isSatellite ? const Color(0xFF0F172A).withValues(alpha: 0.95) : Colors.white;
    final borderPaint = Paint()
      ..color = AppTheme.primary.withValues(alpha: 0.3)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;

    final rrect = RRect.fromRectAndRadius(
      Rect.fromCenter(center: center, width: 74, height: 16),
      const Radius.circular(10),
    );

    canvas.drawRRect(rrect, bgPaint);
    canvas.drawRRect(rrect, borderPaint);

    final textPainter = TextPainter(
      text: TextSpan(
        text: text,
        style: TextStyle(
          color: isSatellite ? Colors.white : AppTheme.primaryDark,
          fontSize: 8.5,
          fontWeight: FontWeight.w700,
        ),
      ),
      textDirection: TextDirection.ltr,
    )..layout();

    textPainter.paint(
      canvas,
      Offset(center.dx - textPainter.width / 2, center.dy - textPainter.height / 2),
    );
  }

  void _drawWaypoints(Canvas canvas, Size size) {
    for (int i = 0; i < waypoints.length; i++) {
      final wp = waypoints[i];
      final pos = Offset(size.width * wp.xPercent, size.height * wp.yPercent);
      final isSelected = (i == selectedIndex);
      final isGPSActive = (i == 0); // Sigiriya is current GPS match

      // 1. Radar pulse ripple for GPS active waypoint
      if (isGPSActive) {
        final rippleRadius = 14 + (pulseValue * 14);
        final rippleAlpha = (1.0 - pulseValue).clamp(0.0, 1.0);
        final ripplePaint = Paint()
          ..color = const Color(0xFF10B981).withValues(alpha: rippleAlpha * 0.45)
          ..style = PaintingStyle.fill;
        canvas.drawCircle(pos, rippleRadius, ripplePaint);
      }

      // 2. Selection halo if clicked
      if (isSelected) {
        final haloPaint = Paint()
          ..color = wp.color.withValues(alpha: 0.22)
          ..style = PaintingStyle.fill;
        canvas.drawCircle(pos, 20, haloPaint);
      }

      // 3. Pin drop shadow
      final shadowPaint = Paint()
        ..color = Colors.black.withValues(alpha: 0.22)
        ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 4);
      canvas.drawCircle(pos.translate(0, 2), 11, shadowPaint);

      // 4. Pin outer ring
      final outerRingPaint = Paint()..color = wp.color;
      canvas.drawCircle(pos, 12, outerRingPaint);

      // 5. Pin inner core
      final innerCorePaint = Paint()..color = Colors.white;
      canvas.drawCircle(pos, 8.5, innerCorePaint);

      // 6. Number inside pin
      final numPainter = TextPainter(
        text: TextSpan(
          text: '${wp.id}',
          style: TextStyle(
            color: wp.color,
            fontSize: 10,
            fontWeight: FontWeight.w900,
          ),
        ),
        textDirection: TextDirection.ltr,
      )..layout();

      numPainter.paint(
        canvas,
        Offset(pos.dx - numPainter.width / 2, pos.dy - numPainter.height / 2),
      );

      // 7. Floating Place Name Label
      _drawFloatingPlaceLabel(canvas, pos, wp, isSelected);
    }
  }

  void _drawFloatingPlaceLabel(
    Canvas canvas,
    Offset pinPos,
    MapWaypoint wp,
    bool isSelected,
  ) {
    // Placement offset (place label slightly above or below to avoid overlaps)
    final isTop = (wp.id != 1);
    final labelOffset = pinPos.translate(0, isTop ? -26 : 22);

    final bgPaint = Paint()
      ..color = isSelected
          ? (isSatellite ? const Color(0xFF064E3B) : AppTheme.primary)
          : (isSatellite ? const Color(0xFF0F172A).withValues(alpha: 0.92) : Colors.white.withValues(alpha: 0.95));

    final borderPaint = Paint()
      ..color = isSelected
          ? Colors.white.withValues(alpha: 0.4)
          : (isSatellite ? Colors.white.withValues(alpha: 0.15) : AppTheme.dividerColor)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;

    final shortTitle = wp.title.split(' ').take(2).join(' ');
    final textPainter = TextPainter(
      text: TextSpan(
        text: shortTitle,
        style: TextStyle(
          color: isSelected
              ? Colors.white
              : (isSatellite ? Colors.white : AppTheme.textPrimary),
          fontSize: 9,
          fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
        ),
      ),
      textDirection: TextDirection.ltr,
    )..layout();

    final pillWidth = textPainter.width + 16;
    const pillHeight = 18.0;

    final rect = RRect.fromRectAndRadius(
      Rect.fromCenter(center: labelOffset, width: pillWidth, height: pillHeight),
      const Radius.circular(10),
    );

    // Subtle drop shadow
    final shadowPaint = Paint()
      ..color = Colors.black.withValues(alpha: 0.12)
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 3);
    canvas.drawRRect(rect.shift(const Offset(0, 1.5)), shadowPaint);

    canvas.drawRRect(rect, bgPaint);
    canvas.drawRRect(rect, borderPaint);

    textPainter.paint(
      canvas,
      Offset(labelOffset.dx - textPainter.width / 2, labelOffset.dy - textPainter.height / 2),
    );
  }

  @override
  bool shouldRepaint(covariant _EnhancedMapCanvasPainter oldDelegate) {
    return oldDelegate.pulseValue != pulseValue ||
        oldDelegate.isSatellite != isSatellite ||
        oldDelegate.zoomScale != zoomScale ||
        oldDelegate.selectedIndex != selectedIndex;
  }
}
