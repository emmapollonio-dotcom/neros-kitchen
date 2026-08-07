export default function CheckEmailPage() {
  return (
    <div className="flex min-h-[calc(100vh-88px)] items-center justify-center px-6 text-center">
      <div className="max-w-sm rounded-panel border border-card-border bg-card p-8 shadow-elevated">
        <h1 className="font-display text-2xl text-card-fg">Controlla la tua email</h1>
        <p className="mt-3 font-body text-sm text-card-fg-secondary">
          Ti abbiamo inviato un link di conferma. Aprilo per attivare il tuo account N&apos;sK.
        </p>
      </div>
    </div>
  );
}
