"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Moon, Sun } from "lucide-react";
import { useLandingTheme } from "./LandingThemeProvider";
import { LandingLanguageSwitcher } from "./LandingLanguageSwitcher";

// Nav a due livelli (10 ago 2026, stile neroskitchen.co.uk): barra sottile
// non-sticky in cima (tagline + lingua + tema) + nav principale che diventa
// fissa/compatta dopo lo scroll (stesso pattern del sito reale dell'utente).
// Contenuti restano quelli N'sK — nessun indirizzo/telefono inventato,
// l'attività è un SaaS senza sede fisica da mostrare qui.
export function LandingNav() {
  const t = useTranslations("landing");
  const tNav = useTranslations("nav");
  const { isDark, toggle } = useLandingTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 80);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "#top", label: tNav("home") },
    { href: "#app-screens", label: t("navFeatures") },
    { href: "/pricing", label: tNav("pricing") },
    { href: "/login", label: tNav("login") },
  ];

  return (
    <>
      {/* Barra superiore sottile — parte del flusso normale, scompare
          semplicemente scrollando (non è fissa). */}
      <div className="border-b" style={{ borderColor: "var(--nsk-l-border)" }}>
        <div className="mx-auto flex max-w-content items-center justify-between gap-4 px-6 py-2.5">
          <p className="hidden sm:block font-body text-[11px] font-medium uppercase tracking-[0.12em]" style={{ color: "var(--nsk-l-text-muted)" }}>
            {t("eyebrow")}
          </p>
          <div className="ml-auto flex items-center gap-2.5">
            <LandingLanguageSwitcher compact />
            <button
              type="button"
              onClick={toggle}
              aria-label="Cambia tema"
              className="flex h-[30px] w-[30px] items-center justify-center rounded-pill border transition-transform duration-[250ms] ease-nsk hover:scale-[1.06]"
              style={{ borderColor: "var(--nsk-l-border)" }}
            >
              {isDark ? <Moon size={12} className="text-[var(--nsk-l-accent)]" /> : <Sun size={12} className="text-[var(--nsk-l-accent)]" />}
            </button>
          </div>
        </div>
      </div>

      {/* Nav principale — statica in cima al caricamento, diventa fissa e
          compatta dopo ~80px di scroll. */}
      <div id="top" className={scrolled ? "h-[70px]" : undefined} aria-hidden={false}>
        <nav
          className={`z-40 border-b transition-all duration-300 ease-nsk ${
            scrolled ? "fixed inset-x-0 top-0 py-3 shadow-[var(--nsk-l-shadow)] backdrop-blur" : "relative py-[18px]"
          }`}
          style={{
            borderColor: "var(--nsk-l-border)",
            backgroundColor: scrolled ? "var(--nsk-l-bg)" : "transparent",
          }}
        >
          <div className="mx-auto flex max-w-content items-center justify-between gap-4 px-6">
            <Link href="#top" className="flex items-center gap-2.5">
              <Image src="/brand/NK-Logo.svg" alt="N'sK" width={30} height={30} className="rounded-nsk" />
              <span className="font-display text-[17px] font-bold tracking-[0.01em]" style={{ color: "var(--nsk-l-accent)" }}>
                N&apos;sK
              </span>
            </Link>

            <ul className="hidden lg:flex items-center gap-8 font-body text-[13px] font-semibold uppercase tracking-[0.08em]">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="transition-colors duration-200 hover:text-[var(--nsk-l-accent)]" style={{ color: "var(--nsk-l-text-secondary)" }}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            <Link
              href="/signup"
              className="rounded-nsk bg-[var(--nsk-l-accent)] px-5 py-[9px] font-body text-[13px] font-semibold text-[#121212] transition-colors duration-[250ms] ease-nsk hover:bg-[var(--nsk-l-accent-dark)]"
            >
              {t("navCta")}
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}
