import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../sync/connectivity_service.dart';
import '../theme/colors.dart';
import '../../l10n/generated/app_localizations.dart';

/// Banner sottile mostrato in cima alle schermate che leggono dati cache-abili
/// (chef, prenotazioni, zero waste) quando il device è offline — così l'utente
/// sa che sta vedendo l'ultima copia locale e non i dati aggiornati.
class OfflineBanner extends ConsumerWidget {
  const OfflineBanner({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final online = ref.watch(isOnlineProvider);
    if (online) return const SizedBox.shrink();

    final l10n = AppLocalizations.of(context)!;

    return Container(
      width: double.infinity,
      color: NskColors.charcoal,
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Text(
        l10n.offlineBannerText,
        textAlign: TextAlign.center,
        style: const TextStyle(color: NskColors.ivory, fontSize: 12),
      ),
    );
  }
}
