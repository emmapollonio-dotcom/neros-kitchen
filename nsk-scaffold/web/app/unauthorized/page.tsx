import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-shell px-6 text-center">
      <div className="max-w-sm">
        <h1 className="font-display text-2xl text-shell-fg">Accesso non consentito</h1>
        <p className="mt-3 font-body text-sm text-shell-fg-secondary">
          Il tuo account non ha i permessi per vedere questa pagina.
        </p>
        <Link href="/" className="mt-6 inline-block text-teal underline">
          Torna alla home
        </Link>
      </div>
    </div>
  );
}
