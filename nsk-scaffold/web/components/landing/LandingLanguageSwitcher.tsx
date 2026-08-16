"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { locales, LOCALE_FLAGS } from "@/i18n/locales";
import { setLocale } from "@/app/actions/set-locale";

interface Props {
  compact?: boolean;
}

// Estratto da LandingFooter (7 ago 2026): pubblico internazionale, deve
// poter cambiare lingua subito, non solo scrollando fino al footer — vive
// quindi anche in LandingNav. compact riduce padding/testo per stare
// nell'header senza spingere via logo e CTA su schermi stretti.
export function LandingLanguageSwitcher({ compact = false }: Props) {
  const currentLocale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function selectLocale(locale: string) {
    startTransition(async () => {
      await setLocale(locale);
      router.refresh();
    });
  }

  return (
    <div className={`flex ${compact ? "gap-1" : "gap-1.5"}`}>
      {locales.map((code) => {
        const active = code === currentLocale;
        return (
          <button
            key={code}
            type="button"
            disabled={isPending}
            onClick={() => selectLocale(code)}
            aria-label={LOCALE_FLAGS[code].label}
            title={LOCALE_FLAGS[code].label}
            className={`flex items-center rounded-pill border font-body font-semibold uppercase transition-colors duration-200 ease-nsk disabled:opacity-60 ${
              compact ? "gap-1 px-2 py-1 text-[10px]" : "gap-1.5 px-[11px] py-[5px] text-[11px]"
            }`}
            style={{
              background: active ? "#117E8E" : "transparent",
              color: active ? "#FFFFFF" : "var(--nsk-l-text-secondary)",
              borderColor: "var(--nsk-l-border)",
            }}
          >
            <span className="text-sm leading-none">{LOCALE_FLAGS[code].flag}</span>
            {!compact && code}
          </button>
        );
      })}
    </div>
  );
}
