"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { locales, LOCALE_FLAGS as FLAGS, type Locale } from "@/i18n/locales";
import { setLocale } from "@/app/actions/set-locale";

// Switcher lingua globale (bandierine, come richiesto) — vive nella nav
// condivisa (SiteHeader per il pubblico, AppNavClient per l'area loggata),
// quindi è visibile su tutto il sito, non solo in home. Scrive lo stesso
// cookie NSK_LOCALE della landing (vedi app/actions/set-locale.ts): la
// selezione è unica e persiste ovunque si navighi.
export function LanguageSwitcher() {
  const currentLocale = useLocale() as Locale;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function selectLocale(locale: Locale) {
    setOpen(false);
    startTransition(async () => {
      await setLocale(locale);
      router.refresh();
    });
  }

  const current = FLAGS[currentLocale] ?? FLAGS.it;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={isPending}
        aria-label="Cambia lingua"
        className="flex items-center gap-1.5 rounded-pill px-3 py-2 font-body text-sm text-shell-fg-secondary transition hover:bg-shell-fg/10 hover:text-shell-fg disabled:opacity-60"
      >
        <span className="text-base leading-none">{current.flag}</span>
        <ChevronDown size={14} className={`transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-3 w-44 rounded-card border border-shell-border bg-shell p-2 shadow-elevated">
          {locales.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => selectLocale(code)}
              className={`flex w-full items-center gap-2.5 rounded-nsk px-3 py-2 font-body text-sm transition hover:bg-shell-fg/10 ${
                code === currentLocale ? "text-teal" : "text-shell-fg"
              }`}
            >
              <span className="text-base leading-none">{FLAGS[code].flag}</span>
              {FLAGS[code].label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
