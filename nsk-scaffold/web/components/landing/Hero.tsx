import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { HeroCarouselBackground } from "./HeroCarouselBackground";

// Hero a schermo intero con carosello foto + testo centrato (10 ago 2026,
// stile neroskitchen.co.uk): il PhoneScreen del prodotto non serve più qui,
// resta comunque visibile poco sotto in Features/AppScreensShowcase.
export async function Hero() {
  const t = await getTranslations("landing");

  return (
    <div className="relative flex min-h-[92vh] w-full items-center justify-center overflow-hidden px-6 py-24">
      <HeroCarouselBackground />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <div className="mb-[22px] inline-flex items-center gap-2 rounded-pill border px-3.5 py-[7px] font-body text-[11px] font-semibold uppercase tracking-[0.05em]" style={{ borderColor: "var(--nsk-l-accent)", color: "var(--nsk-l-accent)" }}>
          {t("eyebrow")}
        </div>
        <h1
          className="mb-6 font-display text-[clamp(2.6rem,6vw,4.4rem)] font-bold uppercase leading-[1.08] tracking-[0.01em]"
          style={{ color: "var(--nsk-l-text)" }}
        >
          {t("h1")}
        </h1>
        <p className="mx-auto mb-10 max-w-xl font-body text-[17px] leading-[1.6]" style={{ color: "var(--nsk-l-text-secondary)" }}>
          {t("subtitle")}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-[22px]">
          <Link
            href="/signup"
            className="rounded-nsk bg-[var(--nsk-l-accent)] px-7 py-3.5 font-body text-sm font-semibold text-[#121212] transition-colors duration-[250ms] ease-nsk hover:bg-[var(--nsk-l-accent-dark)]"
          >
            {t("ctaPrimary")}
          </Link>
          <Link
            href="#app-screens"
            className="flex items-center gap-1.5 font-body text-sm font-semibold transition-colors duration-[250ms] ease-nsk hover:text-[var(--nsk-l-accent)]"
            style={{ color: "var(--nsk-l-text)" }}
          >
            {t("ctaSecondary")} <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
