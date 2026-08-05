import 'package:flutter/material.dart';
import '../theme/colors.dart';
import '../../features/marketplace/presentation/chef_list_screen.dart';
import '../../features/bookings/presentation/bookings_screen.dart';
import '../../features/zero_waste/presentation/zero_waste_screen.dart';
import '../../features/profile/presentation/profile_screen.dart';

/// Shell con navigazione a tab, punto di ingresso post-login. Rispecchia le
/// sezioni N'sK Home lato web (marketplace chef, prenotazioni, zero-waste,
/// profilo) — food-cost/CRM/HACCP/social-studio restano Pro/web-only.
class HomeShell extends StatefulWidget {
  const HomeShell({super.key});

  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  int _index = 0;

  static const _screens = [
    ChefListScreen(),
    BookingsScreen(),
    ZeroWasteScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(index: _index, children: _screens),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _index,
        onTap: (i) => setState(() => _index = i),
        type: BottomNavigationBarType.fixed,
        backgroundColor: NskColors.ivory,
        selectedItemColor: NskColors.charcoal,
        unselectedItemColor: NskColors.smoke,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.restaurant_menu), label: 'Chef'),
          BottomNavigationBarItem(icon: Icon(Icons.event_available), label: 'Prenotazioni'),
          BottomNavigationBarItem(icon: Icon(Icons.eco_outlined), label: 'Zero Waste'),
          BottomNavigationBarItem(icon: Icon(Icons.person_outline), label: 'Profilo'),
        ],
      ),
    );
  }
}
