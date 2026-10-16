import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class AdaptiveRePlanningScreen extends StatefulWidget {
  final VoidCallback onConfirmAdaptiveRoute;

  const AdaptiveRePlanningScreen({
    super.key,
    required this.onConfirmAdaptiveRoute,
  });

  @override
  State<AdaptiveRePlanningScreen> createState() => _AdaptiveRePlanningScreenState();
}

class _AdaptiveRePlanningScreenState extends State<AdaptiveRePlanningScreen> {
  bool _isConfirming = false;

  void _confirm() async {
    setState(() => _isConfirming = true);
    await Future.delayed(const Duration(milliseconds: 500));
    if (mounted) {
      setState(() => _isConfirming = false);
      widget.onConfirmAdaptiveRoute();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Adaptive Re-Planning'),
        actions: [
          IconButton(
            icon: const Icon(Icons.info_outline),
            onPressed: () {
              _showRLInfoDialog(context);
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ALERT BANNER: Schedule Conflict Detected
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppTheme.alertCardBg,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppTheme.alertCardBorder, width: 1.2),
              ),
              child: const Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(Icons.warning_amber_rounded, color: AppTheme.error, size: 24),
                  SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Schedule Conflict Detected',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w800,
                            color: AppTheme.alertCardText,
                          ),
                        ),
                        SizedBox(height: 4),
                        Text(
                          '+45 min unexpected transit delay reported on A11 highway. Original schedule to Dambulla violates closing hours (5:30 PM).',
                          style: TextStyle(fontSize: 12, color: Color(0xFF7F1D1D), height: 1.3),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // RL AGENT RESOLUTION BADGE & CARD
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.primaryLight.withOpacity(0.3)),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.primary.withOpacity(0.04),
                    blurRadius: 10,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppTheme.xaiBadgeBg,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.circle, size: 8, color: AppTheme.success),
                            SizedBox(width: 5),
                            Text(
                              'RL AGENT RESOLUTION (DQN)',
                              style: TextStyle(
                                fontSize: 10.5,
                                fontWeight: FontWeight.w800,
                                color: AppTheme.xaiBadgeText,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const Spacer(),
                      const Text(
                        'Latency: 0.42s',
                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.textMuted),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // State Node Transition Graphic
                  Row(
                    children: [
                      _buildNodePill('Current GPS', 'Sigiriya Rock', Icons.my_location, Colors.blue),
                      const Padding(
                        padding: EdgeInsets.symmetric(horizontal: 8),
                        child: Icon(Icons.arrow_forward, size: 16, color: AppTheme.textMuted),
                      ),
                      _buildNodePill('Target Action', 'Minneriya Safari', Icons.navigation, AppTheme.primary),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // DQN Rationale text
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppTheme.dividerColor),
                    ),
                    child: const Text(
                      'The DQN policy evaluated 12 alternatives in 0.42s without retraining. Minneriya Safari maintains predicted enjoyment score (Reward: +4.8) within your 3-hour window and \$45 constraint.',
                      style: TextStyle(
                        fontSize: 12,
                        height: 1.4,
                        color: AppTheme.textPrimary,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // SECTION: UPDATED OPTIMAL SEQUENCE
            const Text(
              'UPDATED OPTIMAL SEQUENCE',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                letterSpacing: 1.1,
                color: AppTheme.textSecondary,
              ),
            ),
            const SizedBox(height: 10),

            // Card for New Chosen Sequence
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.primary, width: 1.5),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.primary.withOpacity(0.06),
                    blurRadius: 8,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.schedule, size: 15, color: AppTheme.primary),
                      const SizedBox(width: 6),
                      const Text(
                        '03:15 PM – 06:00 PM',
                        style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppTheme.primary),
                      ),
                      const Spacer(),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.green.shade50,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Text(
                          'Feasible: 100%',
                          style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.green),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Minneriya Elephant Safari',
                    style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: AppTheme.textPrimary),
                  ),
                  const SizedBox(height: 4),
                  const Row(
                    children: [
                      Text('\$30.00 Entrance', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppTheme.primary)),
                      SizedBox(width: 8),
                      Text('•', style: TextStyle(color: AppTheme.textMuted)),
                      SizedBox(width: 8),
                      Text('2.5 hrs dwell', style: TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                      SizedBox(width: 8),
                      Text('•', style: TextStyle(color: AppTheme.textMuted)),
                      SizedBox(width: 8),
                      Icon(Icons.star, size: 13, color: Colors.amber),
                      SizedBox(width: 2),
                      Text('4.9/5', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                    ],
                  ),
                  const SizedBox(height: 10),

                  // Natural Language XAI Card
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xFFEDF8F3),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(Icons.check_circle_outline, size: 16, color: AppTheme.primary),
                        SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'Selected because it impacts no closing time, fits exactly in your remaining 2.5-hour window, and retains 98% of your predicted travel enjoyment.',
                            style: TextStyle(fontSize: 11.5, color: Color(0xFF134E39), height: 1.35),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Skipped destination note
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Row(
                children: [
                  Icon(Icons.cancel_outlined, size: 16, color: AppTheme.textMuted),
                  SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Dambulla Cave Temple skipped (prevents night mountain driving violation).',
                      style: TextStyle(
                        fontSize: 11.5,
                        color: AppTheme.textSecondary,
                        decoration: TextDecoration.lineThrough,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Confirm Adaptive Route CTA Button
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton.icon(
                onPressed: _isConfirming ? null : _confirm,
                icon: _isConfirming
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                      )
                    : const Icon(Icons.sync, size: 20),
                label: const Text(
                  'Confirm Adaptive Route 🔄',
                  style: TextStyle(fontSize: 15.5, fontWeight: FontWeight.w700),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primary,
                ),
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildNodePill(String subtitle, String title, IconData icon, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        decoration: BoxDecoration(
          color: color.withOpacity(0.08),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: color.withOpacity(0.25)),
        ),
        child: Row(
          children: [
            Icon(icon, size: 16, color: color),
            const SizedBox(width: 8),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(subtitle, style: TextStyle(fontSize: 9.5, color: color, fontWeight: FontWeight.w600)),
                  Text(
                    title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppTheme.textPrimary),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showRLInfoDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('DQN State-Recovery Engine'),
        content: const Text(
          'In traditional genetic or ant-colony algorithms, re-optimizing takes over 30 seconds. Our custom Deep Q-Network utilizes pre-trained Q-value tables and operational action-masking to recover the optimal route in sub-second latency (0.42s) without retraining.',
          style: TextStyle(fontSize: 13, height: 1.4),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Understood')),
        ],
      ),
    );
  }
}
