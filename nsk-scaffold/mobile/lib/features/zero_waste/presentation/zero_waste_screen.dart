import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/waste_repository.dart';
import '../domain/waste_item.dart';
import '../../../core/database/database_provider.dart';
import '../../../core/theme/colors.dart';
import '../../../core/widgets/offline_banner.dart';
import '../../../l10n/generated/app_localizations.dart';

final wasteRepositoryProvider = Provider((ref) => WasteRepository(ref.watch(appDatabaseProvider)));

final myWasteItemsProvider = FutureProvider<List<WasteItem>>((ref) {
  return ref.watch(wasteRepositoryProvider).myWasteItems();
});

class ZeroWasteScreen extends ConsumerWidget {
  const ZeroWasteScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final itemsAsync = ref.watch(myWasteItemsProvider);
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: NskColors.ivory,
        // "Zero Waste" resta invariato in tutte le lingue: è il nome della
        // funzionalità (stesso trattamento lato web), non un termine da tradurre.
        title: const Text('Zero Waste'),
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: NskColors.charcoal,
        onPressed: () => _showAddDialog(context, ref, l10n),
        child: const Icon(Icons.add, color: NskColors.ivory),
      ),
      body: Column(
        children: [
          const OfflineBanner(),
          Expanded(
            child: RefreshIndicator(
              onRefresh: () => ref.refresh(myWasteItemsProvider.future),
              child: itemsAsync.when(
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (err, _) => Center(child: Text(l10n.errorPrefix('$err'))),
                data: (items) {
                  if (items.isEmpty) {
                    return ListView(
                      children: [
                        const SizedBox(height: 80),
                        Center(child: Text(l10n.noWasteYet)),
                      ],
                    );
                  }
                  return ListView.builder(
                    itemCount: items.length,
                    itemBuilder: (context, i) {
                      final item = items[i];
                      return ListTile(
                        title: Text('${item.quantity} ${item.unit} — ${item.ingredientName}'),
                        subtitle: item.reason != null ? Text(item.reason!) : null,
                      );
                    },
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showAddDialog(BuildContext context, WidgetRef ref, AppLocalizations l10n) {
    final nameController = TextEditingController();
    final quantityController = TextEditingController();
    final unitController = TextEditingController(text: 'kg');
    final reasonController = TextEditingController();

    showDialog<void>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: Text(l10n.logWasteDialogTitle),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameController,
              decoration: InputDecoration(labelText: l10n.ingredientLabel),
            ),
            TextField(
              controller: quantityController,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              decoration: InputDecoration(labelText: l10n.quantityLabel),
            ),
            TextField(
              controller: unitController,
              decoration: InputDecoration(labelText: l10n.unitLabel),
            ),
            TextField(
              controller: reasonController,
              decoration: InputDecoration(labelText: l10n.reasonLabel),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(),
            child: Text(l10n.cancelButton),
          ),
          ElevatedButton(
            onPressed: () async {
              final quantity = double.tryParse(quantityController.text.replaceAll(',', '.'));
              if (nameController.text.trim().isEmpty || quantity == null || quantity <= 0) {
                return;
              }
              await ref.read(wasteRepositoryProvider).logWaste(
                    ingredientName: nameController.text.trim(),
                    quantity: quantity,
                    unit: unitController.text.trim(),
                    reason: reasonController.text.trim().isEmpty ? null : reasonController.text.trim(),
                  );
              ref.invalidate(myWasteItemsProvider);
              if (dialogContext.mounted) Navigator.of(dialogContext).pop();
            },
            child: Text(l10n.saveButton),
          ),
        ],
      ),
    );
  }
}
