import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class ItineraryOptimizationProfileScreen extends StatefulWidget {
  final VoidCallback onGenerateItinerary;

  const ItineraryOptimizationProfileScreen({
    super.key,
    required this.onGenerateItinerary,
  });

  @override
  State<ItineraryOptimizationProfileScreen> createState() =>
      _ItineraryOptimizationProfileScreenState();
}

class _ItineraryOptimizationProfileScreenState
    extends State<ItineraryOptimizationProfileScreen> {
  String _selectedArchetype = 'Couple';
  String _originCountry = 'United Kingdom';
  double _budget = 65.0;
  String _travelPace = 'Balanced';
  TimeOfDay _startTime = const TimeOfDay(hour: 8, minute: 0);
  TimeOfDay _endTime = const TimeOfDay(hour: 20, minute: 0);

  final List<String> _selectedInterests = ['Heritage', 'Wildlife', 'Culture'];
  final List<String> _mandatoryWaypoints = ['Sigiriya Rock Fortress'];

  bool _isOptimizing = false;

  final List<String> _allInterests = [
    'Heritage',
    'Wildlife',
    'Beaches',
    'Hill Country',
    'Culture',
    'Culinary & Tea',
    'Adventure',
  ];

  final List<String> _availableWaypoints = [
    'Sigiriya Rock Fortress',
    'Dambulla Cave Temple',
    'Minneriya National Park',
    'Temple of the Sacred Tooth',
    'Polonnaruwa Ancient City',
  ];

  void _triggerGeneration() async {
    setState(() {
      _isOptimizing = true;
    });

    // Simulate DQN & Random Forest inference time (sub-second target from paper)
    await Future.delayed(const Duration(milliseconds: 750));

    if (mounted) {
      setState(() {
        _isOptimizing = false;
      });
      widget.onGenerateItinerary();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Itinerary Optimization Profile'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            tooltip: 'Reset Constraints',
            onPressed: () {
              setState(() {
                _selectedArchetype = 'Couple';
                _budget = 65.0;
                _travelPace = 'Balanced';
              });
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Research banner
            Container(
              padding: const EdgeInsets.all(12),
              margin: const EdgeInsets.only(bottom: 18),
              decoration: BoxDecoration(
                color: const Color(0xFFEDF7F2),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFCDE8DB)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.auto_awesome, color: AppTheme.primary, size: 20),
                  SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Component 3: RL-Based Adaptive Itinerary Optimizer with Random Forest Sentiment Engine',
                      style: TextStyle(
                        fontSize: 11.5,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.primaryDark,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // SECTION 1: TRAVELLER CLASSIFICATION
            const Text(
              'TRAVELLER CLASSIFICATION',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                letterSpacing: 1.1,
                color: AppTheme.textSecondary,
              ),
            ),
            const SizedBox(height: 4),
            const Text(
              'Calibrate the satisfaction score prediction model (1–5 scale)',
              style: TextStyle(fontSize: 12.5, color: AppTheme.textMuted),
            ),
            const SizedBox(height: 14),

            // Archetype Cards (Solo, Couple, Family)
            Row(
              children: [
                _buildArchetypeCard('Solo', Icons.person_outline),
                const SizedBox(width: 10),
                _buildArchetypeCard('Couple', Icons.people_outline),
                const SizedBox(width: 10),
                _buildArchetypeCard('Family', Icons.family_restroom_outlined),
              ],
            ),
            const SizedBox(height: 18),

            // Origin Country Selector
            Card(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                child: Row(
                  children: [
                    const Icon(Icons.public, color: AppTheme.primary, size: 20),
                    const SizedBox(width: 12),
                    const Expanded(
                      child: Text(
                        'Home Origin / Market:',
                        style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                      ),
                    ),
                    DropdownButton<String>(
                      value: _originCountry,
                      underline: const SizedBox(),
                      items: ['United Kingdom', 'Germany', 'Australia', 'USA', 'France', 'India']
                          .map((country) => DropdownMenuItem(
                                value: country,
                                child: Text(country, style: const TextStyle(fontSize: 13)),
                              ))
                          .toList(),
                      onChanged: (val) {
                        if (val != null) setState(() => _originCountry = val);
                      },
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 14),

            // Interest Chips
            const Text(
              'Preferred Attraction Themes',
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _allInterests.map((interest) {
                final isSelected = _selectedInterests.contains(interest);
                return FilterChip(
                  label: Text(interest),
                  selected: isSelected,
                  selectedColor: AppTheme.primaryLight.withOpacity(0.18),
                  checkmarkColor: AppTheme.primary,
                  labelStyle: TextStyle(
                    fontSize: 12.5,
                    fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                    color: isSelected ? AppTheme.primaryDark : AppTheme.textPrimary,
                  ),
                  backgroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                    side: BorderSide(
                      color: isSelected ? AppTheme.primary : AppTheme.dividerColor,
                    ),
                  ),
                  onSelected: (selected) {
                    setState(() {
                      if (selected) {
                        _selectedInterests.add(interest);
                      } else {
                        _selectedInterests.remove(interest);
                      }
                    });
                  },
                );
              }).toList(),
            ),

            const SizedBox(height: 24),
            const Divider(color: AppTheme.dividerColor),
            const SizedBox(height: 14),

            // SECTION 2: OPTIMIZATION CONSTRAINTS
            const Text(
              'OPTIMIZATION CONSTRAINTS',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                letterSpacing: 1.1,
                color: AppTheme.textSecondary,
              ),
            ),
            const SizedBox(height: 14),

            // Time Windows
            Row(
              children: [
                Expanded(
                  child: _buildTimeBox('Start Window', _startTime, (newTime) {
                    setState(() => _startTime = newTime);
                  }),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildTimeBox('End Window', _endTime, (newTime) {
                    setState(() => _endTime = newTime);
                  }),
                ),
              ],
            ),
            const SizedBox(height: 18),

            // Budget Slider
            Card(
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Max Daily Entrance Fee Budget',
                          style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppTheme.primaryLight.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            '\$${_budget.toInt()} USD',
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: AppTheme.primary,
                            ),
                          ),
                        ),
                      ],
                    ),
                    Slider(
                      value: _budget,
                      min: 20,
                      max: 200,
                      divisions: 18,
                      activeColor: AppTheme.primary,
                      inactiveColor: AppTheme.dividerColor,
                      label: '\$${_budget.toInt()}',
                      onChanged: (val) {
                        setState(() => _budget = val);
                      },
                    ),
                    const Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('\$20 (Budget)', style: TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                        Text('\$200 (Luxury/Parks)', style: TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 14),

            // Travel Pace Segmented Control
            const Text(
              'Travel Pace',
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 8),
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.dividerColor),
              ),
              child: Row(
                children: ['Relaxed', 'Balanced', 'Packed'].map((pace) {
                  final isSelected = _travelPace == pace;
                  return Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _travelPace = pace),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 11),
                        decoration: BoxDecoration(
                          color: isSelected ? AppTheme.primary : Colors.transparent,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Center(
                          child: Text(
                            pace,
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                              color: isSelected ? Colors.white : AppTheme.textSecondary,
                            ),
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
            const SizedBox(height: 18),

            // Mandatory Waypoints
            const Text(
              'Mandatory Waypoints',
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 8),
            Card(
              child: Column(
                children: _availableWaypoints.map((wp) {
                  final isChecked = _mandatoryWaypoints.contains(wp);
                  return CheckboxListTile(
                    title: Text(wp, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
                    value: isChecked,
                    activeColor: AppTheme.primary,
                    dense: true,
                    onChanged: (val) {
                      setState(() {
                        if (val == true) {
                          _mandatoryWaypoints.add(wp);
                        } else {
                          _mandatoryWaypoints.remove(wp);
                        }
                      });
                    },
                  );
                }).toList(),
              ),
            ),

            const SizedBox(height: 24),

            // Action Button
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton.icon(
                onPressed: _isOptimizing ? null : _triggerGeneration,
                icon: _isOptimizing
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5),
                      )
                    : const Icon(Icons.auto_awesome, size: 20),
                label: Text(
                  _isOptimizing ? 'Executing DQN Policy...' : 'Generate AI Itinerary ✨',
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                ),
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildArchetypeCard(String title, IconData icon) {
    final isSelected = _selectedArchetype == title;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _selectedArchetype = title),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 14),
          decoration: BoxDecoration(
            color: isSelected ? AppTheme.primary : Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: isSelected ? AppTheme.primary : AppTheme.dividerColor,
              width: 1.5,
            ),
            boxShadow: isSelected
                ? [
                    BoxShadow(
                      color: AppTheme.primary.withOpacity(0.22),
                      blurRadius: 8,
                      offset: const Offset(0, 3),
                    )
                  ]
                : [],
          ),
          child: Column(
            children: [
              Icon(
                icon,
                color: isSelected ? Colors.white : AppTheme.primary,
                size: 26,
              ),
              const SizedBox(height: 6),
              Text(
                title,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: isSelected ? Colors.white : AppTheme.textPrimary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTimeBox(String label, TimeOfDay time, Function(TimeOfDay) onPicked) {
    return GestureDetector(
      onTap: () async {
        final picked = await showTimePicker(context: context, initialTime: time);
        if (picked != null) onPicked(picked);
      },
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppTheme.dividerColor),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(Icons.schedule, size: 16, color: AppTheme.primary),
                const SizedBox(width: 6),
                Text(
                  time.format(context),
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
