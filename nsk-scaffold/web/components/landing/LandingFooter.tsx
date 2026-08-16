"use client";

import Link from "next/link";
import { LandingLanguageSwitcher } from "./LandingLanguageSwitcher";

export function LandingFooter() {
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
      <LandingLanguageSwitcher />
    </div>
  );
}
