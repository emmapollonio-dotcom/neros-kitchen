import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { PhoneScreen } from "./PhoneScreen";

export async function Hero() {
  const t = await getTranslations("landing");

  return (
    <div className="mx-auto flex max-w-content flex-wrap items-center gap-14 px-6 py-[clamp(48px,8vw,96px)]">
      <div className="min-w-[300px] flex-[1_1_440px]">
        <div className="mb-[22px] inline-flex items-center gap-2 rounded-pill border border-teal px-3.5 py-[7px] font-body text-[11px] font-semibold uppercase tracking-[0.05em] text-teal-dark">
          {t("eyebrow")}
        </div>
        <h1
          className="mb-5 font-display text-[clamp(2.4rem,5vw,3.6rem)] font-bold leading-[1.08] tracking-[-0.015em]"
          style={{ color: "var(--nsk-l-text)" }}
        >
          {t("h1")}
        </h1>
        <p className="mb-8 max-w-[460px] font-body text-[17px] leading-[1.6]" style={{ color: "var(--nsk-l-text-secondary)" }}>
          {t("subtitle")}
        </p>
        <div className="flex flex-wrap items-center gap-[22px]">
          <Link
            href="/signup"
            className="rounded-nsk bg-teal px-7 py-3.5 font-body text-sm font-semibold text-ivory transition-colors duration-[250ms] ease-nsk hover:bg-teal-dark"
          >
            {t("ctaPrimary")}
          </Link>
          <Link
            href="#app-screens"
            className="flex items-center gap-1.5 font-body text-sm font-semibold transition-colors duration-[250ms] ease-nsk hover:text-teal-dark"
            style={{ color: "var(--nsk-l-text)" }}
          >
            {t("ctaSecondary")} <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
      <div className="flex-none">
        <PhoneScreen variant="overview" />
      </div>
    </div>
  );
}
