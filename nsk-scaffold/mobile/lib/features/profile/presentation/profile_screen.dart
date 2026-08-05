import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../auth/data/auth_providers.dart';
import '../../../core/theme/colors.dart';
import '../../../l10n/generated/app_localizations.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: NskColors.ivory,
        title: Text(l10n.profileTitle),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(l10n.accountSectionLabel, style: const TextStyle(color: NskColors.smoke, fontSize: 12)),
            const SizedBox(height: 4),
            Text(user?.email ?? '—', style: Theme.of(context).textTheme.bodyMedium),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: () => Supabase.instance.client.auth.signOut(),
              child: Text(l10n.logoutButton),
            ),
          ],
        ),
      ),
    );
  }
}
