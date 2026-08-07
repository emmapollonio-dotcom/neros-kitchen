"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Moon, Sun } from "lucide-react";
import { useLandingTheme } from "./LandingThemeProvider";

export function LandingNav() {
  const t = useTranslations("landing");
  const { isDark, toggle } = useLandingTheme();

  return (
    <div
      className="mx-auto flex max-w-content items-center justify-between gap-4 border-b px-6 py-[22px]"
      style={{ borderColor: "var(--nsk-l-border)" }}
    >
      <div className="flex items-center gap-2.5">
        <Image src="/brand/NK-Logo.svg" alt="N'sK" width={34} height={34} className="rounded-nsk" />
        <span className="font-display text-[17px] font-bold tracking-[0.01em]" style={{ color: "var(--nsk-l-text)" }}>
          N&apos;sK
        </span>
      </div>
      <div className="flex items-center gap-3.5">
        <button
          type="button"
          onClick={toggle}
          aria-label="Cambia tema"
          className="flex h-[38px] w-[38px] items-center justify-center rounded-pill border transition-transform duration-[250ms] ease-nsk hover:scale-[1.06]"
          style={{ borderColor: "var(--nsk-l-border)" }}
        >
          {isDark ? <Moon size={14} className="text-teal" /> : <Sun size={14} className="text-teal" />}
        </button>
        <Link
          href="/signup"
          className="rounded-nsk bg-teal px-5 py-[9px] font-body text-[13px] font-semibold text-white transition-colors duration-[250ms] ease-nsk hover:bg-teal-dark"
        >
          {t("navCta")}
        </Link>
      </div>
    </div>
  );
}
