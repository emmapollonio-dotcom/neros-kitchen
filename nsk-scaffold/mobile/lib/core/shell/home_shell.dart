import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../theme/colors.dart';
import '../sync/connectivity_service.dart';
import '../sync/sync_service.dart';
import '../../l10n/generated/app_localizations.dart';
import '../../features/marketplace/presentation/chef_list_screen.dart';
import '../../features/bookings/presentation/bookings_screen.dart';
import '../../features/zero_waste/presentation/zero_waste_screen.dart';
import '../../features/profile/presentation/profile_screen.dart';

/// Shell con navigazione a tab, punto di ingresso post-login. Rispecchia le
/// sezioni N'sK Home lato web (marketplace chef, prenotazioni, zero-waste,
/// profilo) — food-cost/CRM/HACCP/social-studio restano Pro/web-only.
class HomeShell extends ConsumerStatefulWidget {
  const HomeShell({super.key});

  @override
  ConsumerState<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends ConsumerState<HomeShell> {
  int _index = 0;

  static const _screens = [
    ChefListScreen(),
    BookingsScreen(),
    ZeroWasteScreen(),
    ProfileScreen(),
  ];

  @override
  void initState() {
    super.initState();
    // Prova a svuotare la coda offline anche subito all'apertura della shell
    // (es. l'app era stata chiusa offline con scritture in sospeso, e viene
    // riaperta quando la connessione è già tornata: senza questo tocco
    // iniziale si aspetterebbe il prossimo *cambio* di stato online/offline).
    Future.microtask(() => ref.read(syncServiceProvider).flushPendingWasteItems());
  }

  @override
  Widget build(BuildContext context) {
    // Ad ogni transizione a "online" (incluso il primo evento in arrivo da
    // connectivity_plus dopo l'avvio) prova a svuotare la coda di scritture
    // Zero Waste rimaste in sospeso da offline — nessuna azione manuale
    // richiesta all'utente.
    ref.listen(isOnlineProvider, (previous, next) {
      if (next && previous != next) {
        ref.read(syncServiceProvider).flushPendingWasteItems();
      }
    });

    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      body: IndexedStack(index: _index, children: _screens),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _index,
        onTap: (i) => setState(() => _index = i),
        type: BottomNavigationBarType.fixed,
        backgroundColor: NskColors.ivory,
        selectedItemColor: NskColors.charcoal,
        unselectedItemColor: NskColors.smoke,
        items: [
          BottomNavigationBarItem(icon: const Icon(Icons.restaurant_menu), label: l10n.navChef),
          BottomNavigationBarItem(icon: const Icon(Icons.event_available), label: l10n.navBookings),
          BottomNavigationBarItem(icon: const Icon(Icons.eco_outlined), label: l10n.navZeroWaste),
          BottomNavigationBarItem(icon: const Icon(Icons.person_outline), label: l10n.navProfile),
        ],
      ),
    );
  }
}
