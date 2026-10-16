import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../widgets/route_map_painter.dart';

class OptimizedDayPlanScreen extends StatelessWidget {
  final VoidCallback onTriggerReplan;
  final VoidCallback onNavigateOnSite;

  const OptimizedDayPlanScreen({
    super.key,
    required this.onTriggerReplan,
    required this.onNavigateOnSite,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Optimized Day Plan'),
        actions: [
          IconButton(
            icon: const Icon(Icons.share_outlined),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Itinerary exported to PDF & Calendar')),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.tune_outlined),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Metrics Bar (Satisfaction, Total Cost, Distance, Constraints)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.dividerColor),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.03),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildMetricItem(
                    label: 'Satisfaction',
                    value: '94%',
                    subtitle: '4.8 ★ VADER',
                    color: AppTheme.success,
                    icon: Icons.sentiment_very_satisfied,
                  ),
                  _buildDivider(),
                  _buildMetricItem(
                    label: 'Total Cost',
                    value: '\$110',
                    subtitle: 'Budget: \$120',
                    color: AppTheme.primary,
                    icon: Icons.account_balance_wallet_outlined,
                  ),
                  _buildDivider(),
                  _buildMetricItem(
                    label: 'Distance',
                    value: '48 km',
                    subtitle: '1h 45m transit',
                    color: AppTheme.accent,
                    icon: Icons.navigation_outlined,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Route Map Preview Canvas
            const RouteMapPreview(),
            const SizedBox(height: 18),

            // Section Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'SEQUENCED DAY ITINERARY',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 1.1,
                    color: AppTheme.textSecondary,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppTheme.xaiBadgeBg,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.check_circle, size: 12, color: AppTheme.xaiBadgeText),
                      SizedBox(width: 4),
                      Text(
                        '0% Constraint Violations',
                        style: TextStyle(
                          fontSize: 10.5,
                          fontWeight: FontWeight.w600,
                          color: AppTheme.xaiBadgeText,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // ITINERARY STOP 1: Sigiriya Rock Fortress
            _buildItineraryCard(
              stopNumber: '1',
              time: '09:30 AM – 12:30 PM',
              title: 'Sigiriya Rock Fortress',
              category: 'UNESCO Heritage',
              cost: '\$35.00',
              dwellTime: '3.0 hrs',
              rating: '4.8',
              xaiExplanation:
                  'Selected because it matches your Heritage interest, high predicted enjoyment for Couple travelers. Scheduled first to avoid midday heat constraint.',
              isCurrent: true,
              onTap: onNavigateOnSite,
            ),

            // Transit Connector 1
            _buildTransitConnector(
              duration: '45 mins drive (17 km)',
              via: 'via Habarana Road • Smooth Traffic',
            ),

            // ITINERARY STOP 2: Traditional Village Lunch
            _buildItineraryCard(
              stopNumber: '2',
              time: '01:15 PM – 02:15 PM',
              title: 'Traditional Village Lunch',
              category: 'Culinary & Culture',
              cost: '\$15.00',
              dwellTime: '1.0 hr',
              rating: '4.6',
              xaiExplanation:
                  'Sequenced to align with your balanced pace and high culinary preference along the transit corridor.',
              actionButton: OutlinedButton.icon(
                onPressed: onTriggerReplan,
                icon: const Icon(Icons.sync_problem, size: 14, color: AppTheme.accent),
                label: const Text(
                  'Skip Next & Re-route 🔄',
                  style: TextStyle(fontSize: 12, color: AppTheme.accent, fontWeight: FontWeight.w700),
                ),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: AppTheme.accent),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                ),
              ),
            ),

            // Transit Connector 2
            _buildTransitConnector(
              duration: '30 mins drive (12 km)',
              via: 'via Minneriya Sanctuary Route',
            ),

            // ITINERARY STOP 3: Minneriya Elephant Safari
            _buildItineraryCard(
              stopNumber: '3',
              time: '03:15 PM – 06:00 PM',
              title: 'Minneriya Elephant Safari',
              category: 'Wildlife & Safari',
              cost: '\$40.00',
              dwellTime: '2.5 hrs',
              rating: '4.9',
              xaiExplanation:
                  'Highest predicted wildlife gathering during 3 PM – 6 PM window. Dwell time strictly respects park closing hours (06:00 PM).',
            ),

            const SizedBox(height: 20),

            // Quick Simulation Bar for viva / testing
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFFFF7ED),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFFFFEDD5)),
              ),
              child: Column(
                children: [
                  const Row(
                    children: [
                      Icon(Icons.bolt, color: AppTheme.accent, size: 20),
                      SizedBox(width: 8),
                      Text(
                        'Simulate Runtime Conflict (Test XAI & RL)',
                        style: TextStyle(
                          fontSize: 12.5,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF9A3412),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Simulate a 45-minute mountain transit delay to test sub-second DQN re-planning without retraining.',
                    style: TextStyle(fontSize: 11.5, color: Color(0xFFC2410C)),
                  ),
                  const SizedBox(height: 10),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: onTriggerReplan,
                      icon: const Icon(Icons.warning_amber_rounded, size: 18),
                      label: const Text('Simulate Delay & Trigger Re-Plan ⚡'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.accent,
                        padding: const EdgeInsets.symmetric(vertical: 11),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricItem({
    required String label,
    required String value,
    required String subtitle,
    required Color color,
    required IconData icon,
  }) {
    return Column(
      children: [
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 14, color: color),
            const SizedBox(width: 4),
            Text(
              value,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w800,
                color: color,
              ),
            ),
          ],
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppTheme.textPrimary),
        ),
        Text(
          subtitle,
          style: const TextStyle(fontSize: 10, color: AppTheme.textMuted),
        ),
      ],
    );
  }

  Widget _buildDivider() {
    return Container(
      height: 32,
      width: 1,
      color: AppTheme.dividerColor,
    );
  }

  Widget _buildItineraryCard({
    required String stopNumber,
    required String time,
    required String title,
    required String category,
    required String cost,
    required String dwellTime,
    required String rating,
    required String xaiExplanation,
    bool isCurrent = false,
    Widget? actionButton,
    VoidCallback? onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        margin: const EdgeInsets.only(bottom: 6),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isCurrent ? AppTheme.primary : AppTheme.dividerColor,
            width: isCurrent ? 1.8 : 1,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.02),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Stop Top Header
            Row(
              children: [
                CircleAvatar(
                  radius: 12,
                  backgroundColor: isCurrent ? AppTheme.primary : AppTheme.primaryLight.withOpacity(0.2),
                  child: Text(
                    stopNumber,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: isCurrent ? Colors.white : AppTheme.primaryDark,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  time,
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppTheme.textSecondary),
                ),
                const Spacer(),
                if (isCurrent)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppTheme.primary.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Text(
                      'CURRENT DESTINATION',
                      style: TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: AppTheme.primary),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 8),

            // Title & Meta
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    title,
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppTheme.textPrimary),
                  ),
                ),
                Row(
                  children: [
                    const Icon(Icons.star, size: 14, color: Colors.amber),
                    const SizedBox(width: 2),
                    Text(
                      rating,
                      style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 4),

            // Subtitle badges (Category, Cost, Duration)
            Row(
              children: [
                Text(category, style: const TextStyle(fontSize: 11.5, color: AppTheme.textMuted)),
                const SizedBox(width: 8),
                const Text('•', style: TextStyle(color: AppTheme.textMuted)),
                const SizedBox(width: 8),
                Text(cost, style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w600, color: AppTheme.primary)),
                const SizedBox(width: 8),
                const Text('•', style: TextStyle(color: AppTheme.textMuted)),
                const SizedBox(width: 8),
                Text(dwellTime, style: const TextStyle(fontSize: 11.5, color: AppTheme.textSecondary)),
              ],
            ),
            const SizedBox(height: 10),

            // Explainable AI (XAI) Insight Card
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFFF1F8F5),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFFD3EADB)),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.psychology, size: 18, color: AppTheme.primary),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      xaiExplanation,
                      style: const TextStyle(
                        fontSize: 11.5,
                        height: 1.35,
                        color: Color(0xFF1E3A2F),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            if (actionButton != null) ...[
              const SizedBox(height: 10),
              actionButton,
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildTransitConnector({required String duration, required String via}) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 4),
      child: Row(
        children: [
          Container(
            height: 24,
            width: 2,
            color: AppTheme.primaryLight.withOpacity(0.4),
          ),
          const SizedBox(width: 14),
          const Icon(Icons.directions_car_filled, size: 14, color: AppTheme.textMuted),
          const SizedBox(width: 6),
          Expanded(
            child: Text(
              '$duration  •  $via',
              style: const TextStyle(fontSize: 11, color: AppTheme.textMuted, fontStyle: FontStyle.italic),
            ),
          ),
        ],
      ),
    );
  }
}
