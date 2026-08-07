import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getCurrentUserInfo } from "@/lib/auth/get-current-user";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

// Header pubblico (marketing): minimale, senza i 4 pilastri dell'app —
// chi non è loggato deve vedere solo "cosa è N'sK" e una via rapida per
// entrare, non l'intera struttura del prodotto. Tradotto (nav.*) — è nella
// nav condivisa, quindi la lingua scelta qui si vede su tutte le pagine
// pubbliche, non solo in home.
export async function SiteHeader() {
  const user = await getCurrentUserInfo();
  const t = await getTranslations("nav");

  return (
    <header className="sticky top-0 z-40 border-b border-haze bg-charcoal/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-content items-center justify-between px-6">
        <Link href="/" className="font-display text-lg tracking-wide text-ivory">
          Nero&apos;s Kitchen
        </Link>

        <nav className="flex items-center gap-2 font-body text-sm">
          <Link href="/chefs" className="rounded-pill px-4 py-2 text-ivory/70 transition hover:bg-ivory/10 hover:text-ivory">
            {t("marketplace")}
          </Link>
          <Link href="/pricing" className="rounded-pill px-4 py-2 text-ivory/70 transition hover:bg-ivory/10 hover:text-ivory">
            {t("pricing")}
          </Link>

          <LanguageSwitcher />

          {user ? (
            <Link
              href="/dashboard"
              className="ml-2 rounded-pill bg-teal px-5 py-2 font-medium text-white transition hover:bg-ivory hover:text-charcoal"
            >
              {t("goToHome")}
            </Link>
          ) : (
            <>
              <Link href="/login" className="rounded-pill px-4 py-2 text-ivory/70 transition hover:bg-ivory/10 hover:text-ivory">
                {t("login")}
              </Link>
              <Link
                href="/signup"
                className="ml-2 rounded-pill bg-teal px-5 py-2 font-medium text-white transition hover:bg-ivory hover:text-charcoal"
              >
                {t("signupFree")}
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
