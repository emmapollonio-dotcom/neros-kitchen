import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../data/booking_repository.dart';
import '../domain/booking.dart';
import '../../../core/database/database_provider.dart';
import '../../../core/theme/colors.dart';
import '../../../core/widgets/offline_banner.dart';
import '../../../l10n/generated/app_localizations.dart';

final bookingRepositoryProvider =
    Provider((ref) => BookingRepository(ref.watch(appDatabaseProvider)));

/// public.booking_status ha 7 valori fissi lato database (vedi
/// supabase/schema.sql): qui mappiamo ciascuno alla stringa tradotta
/// corrispondente invece di una Map statica, così cambia con la lingua
/// del device.
String bookingStatusLabel(AppLocalizations l10n, String status) {
  switch (status) {
    case 'requested':
      return l10n.bookingStatusRequested;
    case 'quoted':
      return l10n.bookingStatusQuoted;
    case 'confirmed':
      return l10n.bookingStatusConfirmed;
    case 'in_progress':
      return l10n.bookingStatusInProgress;
    case 'completed':
      return l10n.bookingStatusCompleted;
    case 'cancelled':
      return l10n.bookingStatusCancelled;
    case 'disputed':
      return l10n.bookingStatusDisputed;
    default:
      return status;
  }
}

final myBookingsProvider = FutureProvider<List<Booking>>((ref) {
  return ref.watch(bookingRepositoryProvider).myBookings();
});

class BookingsScreen extends ConsumerWidget {
  const BookingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final bookingsAsync = ref.watch(myBookingsProvider);
    final l10n = AppLocalizations.of(context)!;
    final dateFormat = DateFormat('d MMMM yyyy, HH:mm', Localizations.localeOf(context).toString());

    return Scaffold(
      appBar: AppBar(
        backgroundColor: NskColors.ivory,
        title: Text(l10n.myBookingsTitle),
      ),
      body: Column(
        children: [
          const OfflineBanner(),
          Expanded(
            child: RefreshIndicator(
              onRefresh: () => ref.refresh(myBookingsProvider.future),
              child: bookingsAsync.when(
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (err, _) => Center(child: Text(l10n.errorPrefix('$err'))),
                data: (bookings) {
                  if (bookings.isEmpty) {
                    return ListView(
                      children: [
                        const SizedBox(height: 80),
                        Center(child: Text(l10n.noBookingsYet)),
                      ],
                    );
                  }
                  return ListView.builder(
                    itemCount: bookings.length,
                    itemBuilder: (context, i) {
                      final booking = bookings[i];
                      return ListTile(
                        title: Text(booking.eventType ?? l10n.eventFallback),
                        subtitle: Text(dateFormat.format(booking.eventDate)),
                        trailing: Text(
                          bookingStatusLabel(l10n, booking.status),
                          style: const TextStyle(color: NskColors.gold),
                        ),
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
}
