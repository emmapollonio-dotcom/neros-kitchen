import 'dart:io';

import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path_provider/path_provider.dart';
import 'package:sqlite3/sqlite3.dart';
import 'package:sqlite3_flutter_libs/sqlite3_flutter_libs.dart';

import 'tables.dart';

part 'app_database.g.dart';

// `app_database.g.dart` è generato da drift_dev, NON committato (vedi
// .gitignore): va rigenerato in locale con
//   dart run build_runner build --delete-conflicting-outputs
// La CI (.github/workflows/ci.yml, job "mobile") lo rigenera da sola ad ogni
// run, quindi non serve mai committarlo a mano.
@DriftDatabase(tables: [CachedChefs, CachedBookings, CachedWasteItems])
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_openConnection());

  @override
  int get schemaVersion => 1;
}

LazyDatabase _openConnection() {
  return LazyDatabase(() async {
    final dbFolder = await getApplicationDocumentsDirectory();
    final file = File('${dbFolder.path}/nsk_cache.sqlite');

    // Necessario su Android: carica la libreria nativa sqlite3 fornita da
    // sqlite3_flutter_libs invece di quella di sistema, spesso troppo
    // vecchia sulle versioni Android meno recenti.
    if (Platform.isAndroid) {
      await applyWorkaroundToOpenSqlite3OnOldAndroidVersions();
    }
    sqlite3.tempDirectory = (await getTemporaryDirectory()).path;

    return NativeDatabase.createInBackground(file);
  });
}
