import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'core/theme/colors.dart';
import 'core/router/go_router_refresh_stream.dart';
import 'core/shell/home_shell.dart';
import 'features/auth/presentation/login_screen.dart';
import 'features/auth/presentation/signup_screen.dart';

final _router = GoRouter(
  initialLocation: '/',
  // Rivaluta `redirect` a ogni login/logout (vedi GoRouterRefreshStream):
  // senza questo, dopo il signOut() in ProfileScreen l'utente resterebbe
  // sulla shell finché non tocca manualmente un link.
  refreshListenable: GoRouterRefreshStream(Supabase.instance.client.auth.onAuthStateChange),
  redirect: (context, state) {
    final loggedIn = Supabase.instance.client.auth.currentSession != null;
    final loggingIn = state.matchedLocation == '/login' || state.matchedLocation == '/signup';

    if (!loggedIn && !loggingIn) return '/login';
    if (loggedIn && loggingIn) return '/';
    return null;
  },
  routes: [
    GoRoute(path: '/', builder: (context, state) => const HomeShell()),
    GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
    GoRoute(path: '/signup', builder: (context, state) => const SignupScreen()),
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
