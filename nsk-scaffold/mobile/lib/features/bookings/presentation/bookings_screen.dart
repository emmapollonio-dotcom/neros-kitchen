import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../data/booking_repository.dart';
import '../domain/booking.dart';
import '../../../core/theme/colors.dart';

final bookingRepositoryProvider = Provider((ref) => BookingRepository());

final myBookingsProvider = FutureProvider<List<Booking>>((ref) {
  return ref.watch(bookingRepositoryProvider).myBookings();
});

class BookingsScreen extends ConsumerWidget {
  const BookingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final bookingsAsync = ref.watch(myBookingsProvider);
    final dateFormat = DateFormat('d MMMM yyyy, HH:mm', 'it_IT');

    return Scaffold(
      appBar: AppBar(
        backgroundColor: NskColors.ivory,
        title: const Text('Le tue prenotazioni'),
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.refresh(myBookingsProvider.future),
        child: bookingsAsync.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (err, _) => Center(child: Text('Errore: $err')),
          data: (bookings) {
            if (bookings.isEmpty) {
              return ListView(
                children: const [
                  SizedBox(height: 80),
                  Center(child: Text('Nessuna prenotazione ancora.')),
                ],
              );
            }
            return ListView.builder(
              itemCount: bookings.length,
              itemBuilder: (context, i) {
                final booking = bookings[i];
                return ListTile(
                  title: Text(booking.eventType ?? 'Evento'),
                  subtitle: Text(dateFormat.format(booking.eventDate)),
                  trailing: Text(
                    bookingStatusLabels[booking.status] ?? booking.status,
                    style: const TextStyle(color: NskColors.gold),
                  ),
                );
              },
            );
          },
        ),
      ),
    );
  }
}
