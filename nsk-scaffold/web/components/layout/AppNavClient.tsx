"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronDown, Menu, X } from "lucide-react";
import { getNskHomeItems, getNskProItems, type NavItem } from "@/lib/nav/pillars";
import { signOutAction } from "@/app/(auth)/actions";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import type { AppTheme } from "@/lib/theme/theme";

interface Props {
  email: string | null;
  isPro: boolean;
  theme: AppTheme;
}

// Nav applicativa a 4 pilastri (Home / N'sK Home / N'sK Pro / Marketplace).
// Il marketplace è raggiungibile anche da anonimi (profili chef pubblici,
// SEO-friendly), quindi questa stessa nav deve reggersi in piedi anche
// senza sessione: in quel caso mostra solo il logo, "Marketplace" e
// Accedi/Inizia gratis — niente pilastri che rimanderebbero a /login.
//
// Tema (7 ago 2026): lo scafo (bg/border/testo diretto) usa i token
// shell-* (theme-aware, vedi globals.css + tailwind.config.ts); i pill
// attivi/CTA (bg-teal text-white) restano fissi in entrambi i temi.
export function AppNavClient({ email, isPro, theme }: Props) {
  const t = useTranslations("nav");
  const tp = useTranslations("pillars");
  const NSK_HOME_ITEMS = getNskHomeItems(tp);
  const NSK_PRO_ITEMS = getNskProItems(tp);
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<"home" | "pro" | "user" | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const isLoggedIn = email !== null;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
  }, [pathname]);

  const isActiveGroup = (items: NavItem[]) => items.some((i) => pathname.startsWith(i.href));

  return (
    <div ref={navRef} className="sticky top-0 z-40 border-b border-shell-border bg-shell/95 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-content items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link
            href={isLoggedIn ? "/dashboard" : "/"}
            className="font-display text-lg tracking-wide text-shell-fg"
          >
            Nero&apos;s Kitchen
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {isLoggedIn && (
              <>
                <PillarLink href="/dashboard" active={pathname === "/dashboard"}>
                  {t("home")}
                </PillarLink>

                <PillarDropdown
                  label={t("nskHome")}
                  items={NSK_HOME_ITEMS}
                  open={openMenu === "home"}
                  active={isActiveGroup(NSK_HOME_ITEMS)}
                  onToggle={() => setOpenMenu(openMenu === "home" ? null : "home")}
                />

                {isPro && (
                  <PillarDropdown
                    label={t("nskPro")}
                    items={NSK_PRO_ITEMS}
                    open={openMenu === "pro"}
                    active={isActiveGroup(NSK_PRO_ITEMS)}
                    onToggle={() => setOpenMenu(openMenu === "pro" ? null : "pro")}
                  />
                )}
              </>
            )}

            <PillarLink href="/chefs" active={pathname.startsWith("/chefs")}>
              {t("marketplace")}
            </PillarLink>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-1 md:flex">
            <ThemeToggle theme={theme} />
            <LanguageSwitcher />
          </div>

          {isLoggedIn ? (
            <div className="relative hidden md:block">
              <button
                onClick={() => setOpenMenu(openMenu === "user" ? null : "user")}
                className="flex h-9 w-9 items-center justify-center rounded-pill bg-teal font-body text-sm font-medium text-white transition hover:bg-teal-dark"
                aria-label="Menu utente"
              >
                {(email[0] ?? "?").toUpperCase()}
              </button>
              {openMenu === "user" && (
                <div className="absolute right-0 mt-3 w-56 rounded-card border border-shell-border bg-shell p-2 shadow-elevated">
                  <p className="truncate px-3 py-2 font-body text-xs text-shell-fg-muted">{email}</p>
                  <Link
                    href="/bookings"
                    className="block rounded-nsk px-3 py-2 font-body text-sm text-shell-fg hover:bg-shell-fg/10"
                  >
                    {t("myBookings")}
                  </Link>
                  <form action={signOutAction}>
                    <button
                      type="submit"
                      className="w-full rounded-nsk px-3 py-2 text-left font-body text-sm text-shell-fg hover:bg-shell-fg/10"
                    >
                      {t("logout")}
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link href="/login" className="rounded-pill px-4 py-2 font-body text-sm text-shell-fg-secondary hover:bg-shell-fg/10 hover:text-shell-fg">
                {t("login")}
              </Link>
              <Link
                href="/signup"
                className="rounded-pill bg-teal px-5 py-2 font-body text-sm font-medium text-white transition hover:bg-teal-dark"
              >
                {t("signupFree")}
              </Link>
            </div>
          )}

          <button
            className="flex h-9 w-9 items-center justify-center rounded-nsk text-shell-fg md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={t("openMenu")}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="border-t border-shell-border bg-shell px-6 py-4 md:hidden">
          {isLoggedIn && (
            <>
              <MobileSection title={t("home")} items={[{ label: t("home"), href: "/dashboard", description: "" }]} />
              <MobileSection title={t("nskHome")} items={NSK_HOME_ITEMS} />
              {isPro && <MobileSection title={t("nskPro")} items={NSK_PRO_ITEMS} />}
            </>
          )}
          <MobileSection title={t("marketplace")} items={[{ label: t("findChef"), href: "/chefs", description: "" }]} />

          <div className="mt-4 flex items-center gap-1 border-t border-shell-border pt-4">
            <ThemeToggle theme={theme} />
            <LanguageSwitcher />
          </div>

          <div className="mt-4 border-t border-shell-border pt-4">
            {isLoggedIn ? (
              <>
                <p className="px-1 font-body text-xs text-shell-fg-muted">{email}</p>
                <form action={signOutAction}>
                  <button type="submit" className="mt-2 font-body text-sm text-shell-fg underline">
                    {t("logout")}
                  </button>
                </form>
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <Link href="/login" className="font-body text-sm text-shell-fg">
                  {t("login")}
                </Link>
                <Link
                  href="/signup"
                  className="w-fit rounded-pill bg-teal px-5 py-2 font-body text-sm font-medium text-white"
                >
                  {t("signupFree")}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PillarLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-pill px-4 py-2 font-body text-sm transition ${
        active ? "bg-teal text-white" : "text-shell-fg-secondary hover:bg-shell-fg/10 hover:text-shell-fg"
      }`}
    >
      {children}
    </Link>
  );
}

function PillarDropdown({
  label,
  items,
  open,
  active,
  onToggle,
}: {
  label: string;
  items: NavItem[];
  open: boolean;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={`flex items-center gap-1 rounded-pill px-4 py-2 font-body text-sm transition ${
          active ? "bg-teal text-white" : "text-shell-fg-secondary hover:bg-shell-fg/10 hover:text-shell-fg"
        }`}
      >
        {label}
        <ChevronDown size={14} className={`transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 mt-3 w-72 rounded-card border border-shell-border bg-shell p-2 shadow-elevated">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-nsk px-3 py-2.5 transition hover:bg-shell-fg/10"
            >
              <p className="font-body text-sm text-shell-fg">{item.label}</p>
              <p className="mt-0.5 font-body text-xs text-shell-fg-muted">{item.description}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function MobileSection({ title, items }: { title: string; items: NavItem[] }) {
  if (items.length === 1 && !items[0].description) {
    return (
      <Link href={items[0].href} className="block py-2 font-body text-sm text-shell-fg">
        {title}
      </Link>
    );
  }
  return (
    <div className="py-2">
      <p className="font-body text-xs uppercase tracking-widest text-shell-fg-muted">{title}</p>
      <div className="mt-2 space-y-1">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className="block py-1.5 font-body text-sm text-shell-fg">
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
