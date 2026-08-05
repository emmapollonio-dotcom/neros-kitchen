"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { NSK_HOME_ITEMS, NSK_PRO_ITEMS, type NavItem } from "@/lib/nav/pillars";
import { signOutAction } from "@/app/(auth)/actions";

interface Props {
  email: string | null;
  isPro: boolean;
}

// Nav applicativa a 4 pilastri (Home / N'sK Home / N'sK Pro / Marketplace).
// Il marketplace è raggiungibile anche da anonimi (profili chef pubblici,
// SEO-friendly), quindi questa stessa nav deve reggersi in piedi anche
// senza sessione: in quel caso mostra solo il logo, "Marketplace" e
// Accedi/Inizia gratis — niente pilastri che rimanderebbero a /login.
export function AppNavClient({ email, isPro }: Props) {
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
    <div ref={navRef} className="sticky top-0 z-40 border-b border-line bg-cream/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-content items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link
            href={isLoggedIn ? "/dashboard" : "/"}
            className="font-display text-lg tracking-wide text-charcoal"
          >
            Nero&apos;s Kitchen
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {isLoggedIn && (
              <>
                <PillarLink href="/dashboard" active={pathname === "/dashboard"}>
                  Home
                </PillarLink>

                <PillarDropdown
                  label="N'sK Home"
                  items={NSK_HOME_ITEMS}
                  open={openMenu === "home"}
                  active={isActiveGroup(NSK_HOME_ITEMS)}
                  onToggle={() => setOpenMenu(openMenu === "home" ? null : "home")}
                />

                {isPro && (
                  <PillarDropdown
                    label="N'sK Pro"
                    items={NSK_PRO_ITEMS}
                    open={openMenu === "pro"}
                    active={isActiveGroup(NSK_PRO_ITEMS)}
                    onToggle={() => setOpenMenu(openMenu === "pro" ? null : "pro")}
                  />
                )}
              </>
            )}

            <PillarLink href="/chefs" active={pathname.startsWith("/chefs")}>
              Marketplace
            </PillarLink>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <div className="relative hidden md:block">
              <button
                onClick={() => setOpenMenu(openMenu === "user" ? null : "user")}
                className="flex h-9 w-9 items-center justify-center rounded-pill bg-charcoal font-body text-sm text-ivory transition hover:bg-gold hover:text-charcoal"
                aria-label="Menu utente"
              >
                {(email[0] ?? "?").toUpperCase()}
              </button>
              {openMenu === "user" && (
                <div className="absolute right-0 mt-3 w-56 rounded-card border border-line bg-white p-2 shadow-elevated">
                  <p className="truncate px-3 py-2 font-body text-xs text-mist">{email}</p>
                  <Link
                    href="/bookings"
                    className="block rounded-nsk px-3 py-2 font-body text-sm text-charcoal hover:bg-cream"
                  >
                    Le mie prenotazioni
                  </Link>
                  <form action={signOutAction}>
                    <button
                      type="submit"
                      className="w-full rounded-nsk px-3 py-2 text-left font-body text-sm text-charcoal hover:bg-cream"
                    >
                      Esci
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link href="/login" className="rounded-pill px-4 py-2 font-body text-sm text-smoke hover:bg-white hover:text-charcoal">
                Accedi
              </Link>
              <Link
                href="/signup"
                className="rounded-pill bg-charcoal px-5 py-2 font-body text-sm text-ivory transition hover:bg-gold hover:text-charcoal"
              >
                Inizia gratis
              </Link>
            </div>
          )}

          <button
            className="flex h-9 w-9 items-center justify-center rounded-nsk text-charcoal md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Apri menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="border-t border-line bg-cream px-6 py-4 md:hidden">
          {isLoggedIn && (
            <>
              <MobileSection title="Home" items={[{ label: "Home", href: "/dashboard", description: "" }]} />
              <MobileSection title="N'sK Home" items={NSK_HOME_ITEMS} />
              {isPro && <MobileSection title="N'sK Pro" items={NSK_PRO_ITEMS} />}
            </>
          )}
          <MobileSection title="Marketplace" items={[{ label: "Trova uno chef", href: "/chefs", description: "" }]} />

          <div className="mt-4 border-t border-line pt-4">
            {isLoggedIn ? (
              <>
                <p className="px-1 font-body text-xs text-mist">{email}</p>
                <form action={signOutAction}>
                  <button type="submit" className="mt-2 font-body text-sm text-charcoal underline">
                    Esci
                  </button>
                </form>
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <Link href="/login" className="font-body text-sm text-charcoal">
                  Accedi
                </Link>
                <Link
                  href="/signup"
                  className="w-fit rounded-pill bg-charcoal px-5 py-2 font-body text-sm text-ivory"
                >
                  Inizia gratis
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
        active ? "bg-charcoal text-ivory" : "text-smoke hover:bg-white hover:text-charcoal"
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
          active ? "bg-charcoal text-ivory" : "text-smoke hover:bg-white hover:text-charcoal"
        }`}
      >
        {label}
        <ChevronDown size={14} className={`transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 mt-3 w-72 rounded-card border border-line bg-white p-2 shadow-elevated">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-nsk px-3 py-2.5 transition hover:bg-cream"
            >
              <p className="font-body text-sm text-charcoal">{item.label}</p>
              <p className="mt-0.5 font-body text-xs text-mist">{item.description}</p>
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
      <Link href={items[0].href} className="block py-2 font-body text-sm text-charcoal">
        {title}
      </Link>
    );
  }
  return (
    <div className="py-2">
      <p className="font-body text-xs uppercase tracking-widest text-mist">{title}</p>
      <div className="mt-2 space-y-1">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className="block py-1.5 font-body text-sm text-charcoal">
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
