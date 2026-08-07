import Link from "next/link";

// Le pagine di accesso restano volutamente senza nav completa: un solo punto
// di uscita (il logo, verso la home pubblica) per non distrarre da login/
// registrazione — lo stesso principio delle auth page di Apple/Stripe.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-shell text-shell-fg">
      <div className="mx-auto max-w-content px-6 py-8">
        <Link href="/" className="font-display text-lg tracking-wide text-shell-fg">
          Nero&apos;s Kitchen
        </Link>
      </div>
      <main>{children}</main>
    </div>
  );
}
