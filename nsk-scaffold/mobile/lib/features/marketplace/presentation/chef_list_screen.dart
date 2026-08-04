import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/chef_repository.dart';
import '../domain/chef.dart';
import '../../../core/theme/colors.dart';

final chefRepositoryProvider = Provider((ref) => ChefRepository());

final chefListProvider = FutureProvider<List<Chef>>((ref) {
  return ref.watch(chefRepositoryProvider).searchChefs();
});

class ChefListScreen extends ConsumerWidget {
  const ChefListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final chefsAsync = ref.watch(chefListProvider);

    return Scaffold(
      appBar: AppBar(
        backgroundColor: NskColors.ivory,
        title: const Text("Nero's Kitchen"),
      ),
      body: chefsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(child: Text('Errore: $err')),
        data: (chefs) => ListView.builder(
          itemCount: chefs.length,
          itemBuilder: (context, i) {
            final chef = chefs[i];
            return ListTile(
              title: Text(chef.businessName ?? chef.fullName),
              subtitle: Text('★ ${chef.ratingAvg} (${chef.ratingCount})'),
              trailing: Text(chef.languages.join(', ')),
            );
          },
        ),
      ),
    );
  }
}
