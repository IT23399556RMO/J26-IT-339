import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class OnSiteSupportScreen extends StatefulWidget {
  const OnSiteSupportScreen({super.key});

  @override
  State<OnSiteSupportScreen> createState() => _OnSiteSupportScreenState();
}

class _OnSiteSupportScreenState extends State<OnSiteSupportScreen> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  final List<Map<String, dynamic>> _messages = [
    {
      'isUser': false,
      'text': 'Welcome to Sigiriya Rock Fortress! You have 2.5 hours scheduled here according to your DQN itinerary. Need help finding facilities or adjusting your schedule?',
      'time': '09:35 AM',
    },
    {
      'isUser': true,
      'text': 'Can I add a quick visit to a local craft market after this?',
      'time': '09:42 AM',
    },
    {
      'isUser': false,
      'text': 'Yes! But it will reduce your dwell time at the Traditional Village Lunch by 20 minutes to maintain your 03:15 PM Minneriya Safari booking.',
      'time': '09:43 AM',
      'actionChip': '+ Add Craft Market (+20m impact)',
    },
  ];

  void _sendMessage([String? textToSend]) {
    final text = textToSend ?? _messageController.text.trim();
    if (text.isEmpty) return;

    setState(() {
      _messages.add({
        'isUser': true,
        'text': text,
        'time': 'Just now',
      });
      _messageController.clear();
    });

    // Provide contextual AI response
    Future.delayed(const Duration(milliseconds: 600), () {
      if (mounted) {
        setState(() {
          if (text.contains('Craft Market')) {
            _messages.add({
              'isUser': false,
              'text': 'Craft market waypoint integrated! Habarana Handicrafts added with 25-minute dwell time. Schedule recalculation successful.',
              'time': 'Just now',
            });
          } else if (text.toLowerCase().contains('ticket') || text.toLowerCase().contains('counter')) {
            _messages.add({
              'isUser': false,
              'text': 'Foreigner ticket counter is located 50m to your left next to the Archaeological Museum. Credit cards and USD/LKR accepted.',
              'time': 'Just now',
            });
          } else if (text.toLowerCase().contains('water') || text.toLowerCase().contains('washroom')) {
            _messages.add({
              'isUser': false,
              'text': 'Sanitary facilities and mineral water booths are available at the base before the Lion Paw staircase.',
              'time': 'Just now',
            });
          } else {
            _messages.add({
              'isUser': false,
              'text': 'Got it! I am tracking your schedule and route constraints in real time. Let me know if you need any adjustments.',
              'time': 'Just now',
            });
          }
        });
      }
    });
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('On-Site Support & Facilities'),
        actions: [
          Container(
            margin: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
            child: ElevatedButton.icon(
              onPressed: () {
                _showSOSDialog(context);
              },
              icon: const Icon(Icons.emergency, size: 14, color: Colors.white),
              label: const Text('SOS', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.error,
                padding: const EdgeInsets.symmetric(horizontal: 10),
                minimumSize: const Size(60, 32),
              ),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          // Current Destination Live Status Card
          Container(
            margin: const EdgeInsets.all(16),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF0F5A44), Color(0xFF1E8266)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: AppTheme.primary.withOpacity(0.2),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
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
                        color: Colors.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Text(
                        'ARRIVED AT DESTINATION 1 OF 3',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                          letterSpacing: 0.8,
                        ),
                      ),
                    ),
                    const Spacer(),
                    const Icon(Icons.wb_sunny_outlined, size: 16, color: Colors.amberAccent),
                    const SizedBox(width: 4),
                    const Text('29°C Clear', style: TextStyle(fontSize: 11.5, color: Colors.white)),
                  ],
                ),
                const SizedBox(height: 8),
                const Text(
                  'Sigiriya Rock Fortress',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: Colors.white),
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    const Icon(Icons.timelapse, size: 13, color: Colors.white70),
                    const SizedBox(width: 4),
                    const Text('Dwell remaining: 1h 45m', style: TextStyle(fontSize: 12, color: Colors.white70)),
                    const SizedBox(width: 12),
                    const Text('•', style: TextStyle(color: Colors.white54)),
                    const SizedBox(width: 12),
                    const Icon(Icons.storefront, size: 13, color: Colors.white70),
                    const SizedBox(width: 4),
                    const Text('Open until 5:30 PM', style: TextStyle(fontSize: 12, color: Colors.white70)),
                  ],
                ),
              ],
            ),
          ),

          // QUICK-ACCESS FACILITY GRID (4 Quick Tiles)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                _buildFacilityTile('Parking', 'Free Lot A', Icons.local_parking, Colors.blue),
                const SizedBox(width: 8),
                _buildFacilityTile('Washrooms', 'Near Gate', Icons.wc, Colors.teal),
                const SizedBox(width: 8),
                _buildFacilityTile('ATM / Forex', '250m Away', Icons.atm, Colors.amber.shade800),
                const SizedBox(width: 8),
                _buildFacilityTile('First Aid', 'Entrance', Icons.medical_services_outlined, Colors.redAccent),
              ],
            ),
          ),
          const SizedBox(height: 12),

          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16),
            child: Divider(color: AppTheme.dividerColor),
          ),

          // CONVERSATIONAL AI ITINERARY ASSISTANT
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: Row(
              children: [
                const Icon(Icons.smart_toy_outlined, size: 16, color: AppTheme.primary),
                const SizedBox(width: 6),
                const Text(
                  'AI On-Site Assistant',
                  style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: AppTheme.textPrimary),
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: Colors.green.shade50,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Text(
                    'Online • Instant Latency',
                    style: TextStyle(fontSize: 10, color: Colors.green, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
          ),

          // Chat Messages List
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              itemCount: _messages.length,
              itemBuilder: (ctx, index) {
                final msg = _messages[index];
                final isUser = msg['isUser'] as bool;
                final text = msg['text'] as String;
                final time = msg['time'] as String;
                final actionChip = msg['actionChip'] as String?;

                return Align(
                  alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    constraints: BoxConstraints(
                      maxWidth: MediaQuery.of(context).size.width * 0.82,
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    decoration: BoxDecoration(
                      color: isUser ? AppTheme.primary : Colors.white,
                      borderRadius: BorderRadius.only(
                        topLeft: const Radius.circular(14),
                        topRight: const Radius.circular(14),
                        bottomLeft: Radius.circular(isUser ? 14 : 2),
                        bottomRight: Radius.circular(isUser ? 2 : 14),
                      ),
                      border: isUser ? null : Border.all(color: AppTheme.dividerColor),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.02),
                          blurRadius: 4,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment:
                          isUser ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                      children: [
                        Text(
                          text,
                          style: TextStyle(
                            fontSize: 12.5,
                            height: 1.35,
                            color: isUser ? Colors.white : AppTheme.textPrimary,
                          ),
                        ),
                        if (actionChip != null) ...[
                          const SizedBox(height: 8),
                          ActionChip(
                            avatar: const Icon(Icons.add_location_alt, size: 14, color: AppTheme.primary),
                            label: Text(actionChip, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                            backgroundColor: AppTheme.xaiBadgeBg,
                            side: const BorderSide(color: Color(0xFFC7E8D6)),
                            onPressed: () {
                              _sendMessage(actionChip);
                            },
                          ),
                        ],
                        const SizedBox(height: 4),
                        Text(
                          time,
                          style: TextStyle(
                            fontSize: 9.5,
                            color: isUser ? Colors.white70 : AppTheme.textMuted,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),

          // Message Input Field
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.white,
              border: const Border(top: BorderSide(color: AppTheme.dividerColor)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.03),
                  blurRadius: 8,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            child: SafeArea(
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _messageController,
                      decoration: InputDecoration(
                        hintText: 'Ask about facilities or schedule changes...',
                        hintStyle: const TextStyle(fontSize: 12.5, color: AppTheme.textMuted),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        filled: true,
                        fillColor: const Color(0xFFF8FAFC),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(22),
                          borderSide: const BorderSide(color: AppTheme.dividerColor),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(22),
                          borderSide: const BorderSide(color: AppTheme.dividerColor),
                        ),
                      ),
                      onSubmitted: (_) => _sendMessage(),
                    ),
                  ),
                  const SizedBox(width: 8),
                  CircleAvatar(
                    backgroundColor: AppTheme.primary,
                    radius: 20,
                    child: IconButton(
                      icon: const Icon(Icons.send_rounded, size: 18, color: Colors.white),
                      onPressed: () => _sendMessage(),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFacilityTile(String title, String subtitle, IconData icon, Color color) {
    return Expanded(
      child: GestureDetector(
        onTap: () {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Navigating to $title ($subtitle)...')),
          );
        },
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 6),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppTheme.dividerColor),
          ),
          child: Column(
            children: [
              Icon(icon, size: 20, color: color),
              const SizedBox(height: 4),
              Text(
                title,
                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
              ),
              const SizedBox(height: 2),
              Text(
                subtitle,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontSize: 9, color: AppTheme.textMuted),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showSOSDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.emergency, color: Colors.red),
            SizedBox(width: 8),
            Text('Sri Lanka Tourist Police & SOS'),
          ],
        ),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Tourist Police Emergency Hotline: 1912', style: TextStyle(fontWeight: FontWeight.bold)),
            SizedBox(height: 6),
            Text('Ambulance / Suwa Seriya: 1990'),
            SizedBox(height: 6),
            Text('Sigiriya Security Desk: +94 66 2286 100'),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Close')),
        ],
      ),
    );
  }
}
