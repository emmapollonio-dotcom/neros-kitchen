import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/theme/colors.dart';

class SignupScreen extends StatefulWidget {
  const SignupScreen({super.key});

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  final _fullName = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _loading = false;
  bool _checkEmail = false;
  String? _error;

  Future<void> _signUp() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final res = await Supabase.instance.client.auth.signUp(
        email: _email.text.trim(),
        password: _password.text,
        data: {'full_name': _fullName.text.trim()},
      );
      // Se la conferma email è attiva su Supabase Auth (come lato web),
      // session è null finché l'utente non clicca il link ricevuto via
      // email: mostriamo lo stesso messaggio della pagina web
      // /signup/check-email invece di dare per scontato il login immediato.
      if (res.session == null) {
        setState(() => _checkEmail = true);
      }
    } on AuthException catch (e) {
      setState(() => _error = e.message);
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_checkEmail) {
      return Scaffold(
        backgroundColor: NskColors.ivory,
        body: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text('Controlla la tua email', style: Theme.of(context).textTheme.displayLarge),
              const SizedBox(height: 12),
              const Text(
                'Ti abbiamo inviato un link di conferma. Aprilo per attivare il tuo account, poi torna qui ad accedere.',
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () => context.go('/login'),
                child: const Text('Torna al login'),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: NskColors.ivory,
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Crea account', style: Theme.of(context).textTheme.displayLarge),
            const SizedBox(height: 24),
            TextField(
              controller: _fullName,
              decoration: const InputDecoration(labelText: 'Nome completo'),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _email,
              decoration: const InputDecoration(labelText: 'Email'),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _password,
              obscureText: true,
              decoration: const InputDecoration(labelText: 'Password'),
            ),
            if (_error != null) ...[
              const SizedBox(height: 12),
              Text(_error!, style: const TextStyle(color: Colors.red)),
            ],
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _loading ? null : _signUp,
              child: _loading
                  ? const CircularProgressIndicator()
                  : const Text('Registrati'),
            ),
            const SizedBox(height: 12),
            TextButton(
              onPressed: () => context.go('/login'),
              child: const Text('Hai già un account? Accedi'),
            ),
          ],
        ),
      ),
    );
  }
}
