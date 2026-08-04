export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ivory px-6 text-center">
      <div className="max-w-sm">
        <h1 className="font-display text-2xl text-charcoal">Accesso non consentito</h1>
        <p className="mt-3 font-body text-sm text-smoke">
          Il tuo account non ha i permessi per vedere questa pagina.
        </p>
        <a href="/" className="mt-6 inline-block text-gold underline">
          Torna alla home
        </a>
      </div>
    </main>
  );
}
