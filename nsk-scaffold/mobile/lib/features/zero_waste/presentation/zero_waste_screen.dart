import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/waste_repository.dart';
import '../domain/waste_item.dart';
import '../../../core/theme/colors.dart';

final wasteRepositoryProvider = Provider((ref) => WasteRepository());

final myWasteItemsProvider = FutureProvider<List<WasteItem>>((ref) {
  return ref.watch(wasteRepositoryProvider).myWasteItems();
});

class ZeroWasteScreen extends ConsumerWidget {
  const ZeroWasteScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final itemsAsync = ref.watch(myWasteItemsProvider);

    return Scaffold(
      appBar: AppBar(
        backgroundColor: NskColors.ivory,
        title: const Text('Zero Waste'),
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: NskColors.charcoal,
        onPressed: () => _showAddDialog(context, ref),
        child: const Icon(Icons.add, color: NskColors.ivory),
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.refresh(myWasteItemsProvider.future),
        child: itemsAsync.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (err, _) => Center(child: Text('Errore: $err')),
          data: (items) {
            if (items.isEmpty) {
              return ListView(
                children: const [
                  SizedBox(height: 80),
                  Center(child: Text('Nessuno spreco registrato ancora.')),
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
    );
  }

  void _showAddDialog(BuildContext context, WidgetRef ref) {
    final nameController = TextEditingController();
    final quantityController = TextEditingController();
    final unitController = TextEditingController(text: 'kg');
    final reasonController = TextEditingController();

    showDialog<void>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Registra uno spreco'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameController,
              decoration: const InputDecoration(labelText: 'Ingrediente'),
            ),
            TextField(
              controller: quantityController,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              decoration: const InputDecoration(labelText: 'Quantità'),
            ),
            TextField(
              controller: unitController,
              decoration: const InputDecoration(labelText: 'Unità (kg, L, pz...)'),
            ),
            TextField(
              controller: reasonController,
              decoration: const InputDecoration(labelText: 'Motivo (opzionale)'),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(),
            child: const Text('Annulla'),
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
            child: const Text('Salva'),
          ),
        ],
      ),
    );
  }
}
