import { cookies } from "next/headers";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getCurrentUserInfo } from "@/lib/auth/get-current-user";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { THEME_COOKIE, type AppTheme } from "@/lib/theme/theme";

// Header pubblico (marketing): minimale, senza i 4 pilastri dell'app —
// chi non è loggato deve vedere solo "cosa è N'sK" e una via rapida per
// entrare, non l'intera struttura del prodotto. Tradotto (nav.*) — è nella
// nav condivisa, quindi la lingua scelta qui si vede su tutte le pagine
// pubbliche, non solo in home.
export async function SiteHeader() {
  const user = await getCurrentUserInfo();
  const t = await getTranslations("nav");
  const cookieStore = await cookies();
  const theme: AppTheme = cookieStore.get(THEME_COOKIE)?.value === "light" ? "light" : "dark";

  return (
    <header className="sticky top-0 z-40 border-b border-shell-border bg-shell/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-content items-center justify-between px-6">
        <Link href="/" className="font-display text-lg tracking-wide text-shell-fg">
          Nero&apos;s Kitchen
        </Link>

        <nav className="flex items-center gap-2 font-body text-sm">
          <Link href="/chefs" className="rounded-pill px-4 py-2 text-shell-fg-secondary transition hover:bg-shell-fg/10 hover:text-shell-fg">
            {t("marketplace")}
          </Link>
          <Link href="/pricing" className="rounded-pill px-4 py-2 text-shell-fg-secondary transition hover:bg-shell-fg/10 hover:text-shell-fg">
            {t("pricing")}
          </Link>

          <ThemeToggle theme={theme} />
          <LanguageSwitcher />

          {user ? (
            <Link
              href="/dashboard"
              className="ml-2 rounded-pill bg-teal px-5 py-2 font-medium text-white transition hover:bg-teal-dark"
            >
              {t("goToHome")}
            </Link>
          ) : (
            <>
              <Link href="/login" className="rounded-pill px-4 py-2 text-shell-fg-secondary transition hover:bg-shell-fg/10 hover:text-shell-fg">
                {t("login")}
              </Link>
              <Link
                href="/signup"
                className="ml-2 rounded-pill bg-teal px-5 py-2 font-medium text-white transition hover:bg-teal-dark"
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
