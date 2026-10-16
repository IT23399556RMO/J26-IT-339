import 'package:flutter/material.dart';
import 'theme/app_theme.dart';
import 'screens/profile_screen.dart';
import 'screens/day_plan_screen.dart';
import 'screens/re_planning_screen.dart';
import 'screens/on_site_screen.dart';

void main() {
  runApp(const SriLankaTourismApp());
}

class SriLankaTourismApp extends StatelessWidget {
  const SriLankaTourismApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AI Tourism Decision Support System - Component 3',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: const MainNavigationShell(),
    );
  }
}

class MainNavigationShell extends StatefulWidget {
  const MainNavigationShell({super.key});

  @override
  State<MainNavigationShell> createState() => _MainNavigationShellState();
}

class _MainNavigationShellState extends State<MainNavigationShell> {
  int _currentIndex = 0;
  bool _forceMobileFrame = true;

  void _navigateToIndex(int index) {
    setState(() {
      _currentIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    final List<Widget> screens = [
      ItineraryOptimizationProfileScreen(
        onGenerateItinerary: () => _navigateToIndex(1),
      ),
      OptimizedDayPlanScreen(
        onTriggerReplan: () => _navigateToIndex(2),
        onNavigateOnSite: () => _navigateToIndex(3),
      ),
      AdaptiveRePlanningScreen(
        onConfirmAdaptiveRoute: () {
          _navigateToIndex(1);
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('DQN Policy applied! Route updated with sub-second latency.'),
              backgroundColor: AppTheme.primary,
            ),
          );
        },
      ),
      const OnSiteSupportScreen(),
    ];

    final Widget appScaffold = Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: screens,
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          border: const Border(top: BorderSide(color: AppTheme.dividerColor)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 10,
              offset: const Offset(0, -3),
            ),
          ],
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: _navigateToIndex,
          type: BottomNavigationBarType.fixed,
          backgroundColor: Colors.white,
          selectedItemColor: AppTheme.primary,
          unselectedItemColor: AppTheme.textMuted,
          selectedFontSize: 11.5,
          unselectedFontSize: 11,
          selectedLabelStyle: const TextStyle(fontWeight: FontWeight.w700),
          unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.w500),
          elevation: 0,
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.tune_rounded),
              activeIcon: Icon(Icons.tune),
              label: 'Profile / Plan',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.map_outlined),
              activeIcon: Icon(Icons.map_rounded),
              label: 'Day Plan',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.sync_problem_outlined),
              activeIcon: Icon(Icons.sync),
              label: 'Re-Plan',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.support_agent_outlined),
              activeIcon: Icon(Icons.support_agent_rounded),
              label: 'On-Site',
            ),
          ],
        ),
      ),
    );

    return LayoutBuilder(
      builder: (context, constraints) {
        // If on actual mobile device or user toggled off frame, show native full screen
        if (constraints.maxWidth <= 550 || !_forceMobileFrame) {
          return appScaffold;
        }

        // On desktop/large screens, present as a sleek mobile phone frame matching Report Page 34
        return Scaffold(
          backgroundColor: const Color(0xFF0F172A), // Dark slate presentation background
          body: Stack(
            children: [
              // Background subtle branding & helper controls
              Positioned(
                top: 14,
                left: 20,
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.smartphone_rounded, color: Colors.white, size: 16),
                          SizedBox(width: 6),
                          Text(
                            'Mobile Prototype View (J26-IT339)',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              Positioned(
                top: 14,
                right: 20,
                child: TextButton.icon(
                  style: TextButton.styleFrom(
                    backgroundColor: Colors.white.withValues(alpha: 0.12),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                  ),
                  onPressed: () {
                    setState(() {
                      _forceMobileFrame = !_forceMobileFrame;
                    });
                  },
                  icon: const Icon(Icons.fullscreen_rounded, size: 16),
                  label: const Text('Full Screen', style: TextStyle(fontSize: 12)),
                ),
              ),
              // Centered Mobile Mockup Container
              Center(
                child: Container(
                  width: 412,
                  height: constraints.maxHeight > 880 ? 840 : constraints.maxHeight * 0.94,
                  margin: const EdgeInsets.symmetric(vertical: 24),
                  decoration: BoxDecoration(
                    color: Colors.black,
                    borderRadius: BorderRadius.circular(44),
                    border: Border.all(color: const Color(0xFF334155), width: 6),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.5),
                        blurRadius: 40,
                        spreadRadius: 4,
                        offset: const Offset(0, 16),
                      ),
                    ],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(38),
                    child: Column(
                      children: [
                        // Simulated Mobile Status Bar with Dynamic Island / Speaker notch
                        Container(
                          height: 34,
                          color: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 24),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                '09:41',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                  color: Color(0xFF1E293B),
                                ),
                              ),
                              // Pill notch
                              Container(
                                width: 85,
                                height: 16,
                                decoration: BoxDecoration(
                                  color: Colors.black,
                                  borderRadius: BorderRadius.circular(20),
                                ),
                              ),
                              const Row(
                                children: [
                                  Icon(Icons.signal_cellular_alt_rounded, size: 14, color: Color(0xFF1E293B)),
                                  SizedBox(width: 4),
                                  Icon(Icons.wifi_rounded, size: 14, color: Color(0xFF1E293B)),
                                  SizedBox(width: 4),
                                  Icon(Icons.battery_full_rounded, size: 14, color: Color(0xFF1E293B)),
                                ],
                              ),
                            ],
                          ),
                        ),
                        // The actual Flutter Mobile App
                        Expanded(child: appScaffold),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
