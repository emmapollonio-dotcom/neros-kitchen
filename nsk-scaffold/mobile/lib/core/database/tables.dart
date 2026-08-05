import 'package:drift/drift.dart';

/// Cache locale della lista chef (v_chef_public_profile). Sola lettura:
/// sovrascritta per intero ad ogni fetch riuscito, letta quando la rete non
/// è raggiungibile.
class CachedChefs extends Table {
  TextColumn get id => text()();
  TextColumn get fullName => text()();
  TextColumn get businessName => text().nullable()();
  RealColumn get ratingAvg => real()();
  IntColumn get ratingCount => integer()();
  TextColumn get languagesJson => text()(); // jsonEncode(List<String>)
  DateTimeColumn get cachedAt => dateTime()();

  @override
  Set<Column> get primaryKey => {id};
}

/// Cache locale delle prenotazioni dell'utente corrente. Sola lettura, stesso
/// pattern di CachedChefs.
class CachedBookings extends Table {
  TextColumn get id => text()();
  TextColumn get chefId => text()();
  TextColumn get status => text()();
  TextColumn get eventType => text().nullable()();
  DateTimeColumn get eventDate => dateTime()();
  IntColumn get guestCount => integer().nullable()();
  RealColumn get quoteAmount => real().nullable()();
  TextColumn get currency => text()();
  DateTimeColumn get cachedAt => dateTime()();

  @override
  Set<Column> get primaryKey => {id};
}

/// Cache + coda di scrittura per gli sprechi Zero Waste: a differenza delle
/// due tabelle sopra, qui si può anche SCRIVERE offline (logWaste). Le righe
/// create offline hanno remoteId null e synced=false finché SyncService non
/// riesce a inviarle a Supabase.
class CachedWasteItems extends Table {
  IntColumn get localId => integer().autoIncrement()();
  TextColumn get remoteId => text().nullable()();
  TextColumn get ingredientName => text()();
  RealColumn get quantity => real()();
  TextColumn get unit => text()();
  TextColumn get reason => text().nullable()();
  DateTimeColumn get loggedAt => dateTime()();
  BoolColumn get synced => boolean().withDefault(const Constant(true))();
}
