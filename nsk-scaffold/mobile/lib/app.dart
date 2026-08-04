import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'core/theme/colors.dart';
import 'features/marketplace/presentation/chef_list_screen.dart';
import 'features/auth/presentation/login_screen.dart';

final _router = GoRouter(
  routes: [
    GoRoute(path: '/', builder: (context, state) => const ChefListScreen()),
    GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
  ],
);

class NskApp extends StatelessWidget {
  const NskApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: "Nero's Kitchen",
      theme: buildNskTheme(),
      routerConfig: _router,
      debugShowCheckedModeBanner: false,
      supportedLocales: const [
        Locale('it'),
        Locale('en'),
        Locale('fr'),
        Locale('es'),
        Locale('ar'),
      ],
    );
  }
}
