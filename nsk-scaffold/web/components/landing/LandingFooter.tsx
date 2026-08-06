"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import Link from "next/link";
import { locales } from "@/i18n/locales";
import { setLocale } from "@/app/actions/set-locale";

export function LandingFooter() {
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
    <div
      className="mx-auto flex max-w-content flex-wrap items-center justify-between gap-5 border-t px-6 py-8"
      style={{ borderColor: "var(--nsk-l-border)" }}
    >
      <div className="font-body text-[13px] font-semibold" style={{ color: "var(--nsk-l-text-muted)" }}>
        © 2026 N&apos;sK — Nero&apos;s Kitchen
      </div>
      <div className="flex flex-wrap gap-[22px]">
        <Link href="#" className="font-body text-[13px] font-medium" style={{ color: "var(--nsk-l-text-secondary)" }}>
          FAQ
        </Link>
        <Link href="#" className="font-body text-[13px] font-medium" style={{ color: "var(--nsk-l-text-secondary)" }}>
          Contatti
        </Link>
        <Link href="/privacy" className="font-body text-[13px] font-medium" style={{ color: "var(--nsk-l-text-secondary)" }}>
          Privacy
        </Link>
      </div>
      <div className="flex gap-1.5">
        {locales.map((code) => {
          const active = code === currentLocale;
          return (
            <button
              key={code}
              type="button"
              disabled={isPending}
              onClick={() => selectLocale(code)}
              className="rounded-pill border px-[11px] py-[5px] font-body text-[11px] font-semibold uppercase transition-colors duration-200 ease-nsk disabled:opacity-60"
              style={{
                background: active ? "#117E8E" : "transparent",
                color: active ? "#121212" : "var(--nsk-l-text-secondary)",
                borderColor: "var(--nsk-l-border)",
              }}
            >
              {code}
            </button>
          );
        })}
      </div>
    </div>
  );
}
