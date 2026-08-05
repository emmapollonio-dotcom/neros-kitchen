import Link from "next/link";
import { getCurrentUserInfo } from "@/lib/auth/get-current-user";

// Header pubblico (marketing): minimale, senza i 4 pilastri dell'app —
// chi non è loggato deve vedere solo "cosa è N'sK" e una via rapida per
// entrare, non l'intera struttura del prodotto.
export async function SiteHeader() {
  const user = await getCurrentUserInfo();

  return (
    <header className="sticky top-0 z-40 border-b border-haze bg-charcoal/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-content items-center justify-between px-6">
        <Link href="/" className="font-display text-lg tracking-wide text-ivory">
          Nero&apos;s Kitchen
        </Link>

        <nav className="flex items-center gap-2 font-body text-sm">
          <Link href="/chefs" className="rounded-pill px-4 py-2 text-ivory/70 transition hover:bg-ivory/10 hover:text-ivory">
            Marketplace
          </Link>
          <Link href="/pricing" className="rounded-pill px-4 py-2 text-ivory/70 transition hover:bg-ivory/10 hover:text-ivory">
            Prezzi
          </Link>

          {user ? (
            <Link
              href="/dashboard"
              className="ml-2 rounded-pill bg-gold px-5 py-2 font-medium text-charcoal transition hover:bg-ivory"
            >
              Vai alla tua Home
            </Link>
          ) : (
            <>
              <Link href="/login" className="rounded-pill px-4 py-2 text-ivory/70 transition hover:bg-ivory/10 hover:text-ivory">
                Accedi
              </Link>
              <Link
                href="/signup"
                className="ml-2 rounded-pill bg-gold px-5 py-2 font-medium text-charcoal transition hover:bg-ivory"
              >
                Inizia gratis
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
