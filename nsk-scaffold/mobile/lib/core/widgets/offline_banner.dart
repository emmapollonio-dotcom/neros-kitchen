import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../sync/connectivity_service.dart';
import '../theme/colors.dart';

/// Banner sottile mostrato in cima alle schermate che leggono dati cache-abili
/// (chef, prenotazioni, zero waste) quando il device è offline — così l'utente
/// sa che sta vedendo l'ultima copia locale e non i dati aggiornati.
class OfflineBanner extends ConsumerWidget {
  const OfflineBanner({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final online = ref.watch(isOnlineProvider);
    if (online) return const SizedBox.shrink();

    return Container(
      width: double.infinity,
      color: NskColors.charcoal,
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: const Text(
        'Modalità offline — stai vedendo gli ultimi dati salvati',
        textAlign: TextAlign.center,
        style: TextStyle(color: NskColors.ivory, fontSize: 12),
      ),
    );
  }
}
