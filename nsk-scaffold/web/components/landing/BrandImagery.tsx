import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Reveal } from "./Reveal";

export async function BrandImagery() {
  const t = await getTranslations("landing");

  const PHOTOS = [
    { src: "/images/landing/piatto-signature.webp", alt: t("brandImageryAltDish") },
    { src: "/images/landing/ambiente-cucina.webp", alt: t("brandImageryAltKitchen") },
    { src: "/images/landing/ingredienti-freschi.webp", alt: t("brandImageryAltIngredients") },
  ];

  return (
    <div className="mx-auto max-w-content px-6 pb-[88px]">
      <div className="mx-auto mb-10 max-w-[600px] text-center">
        <h2 className="mb-3 font-display text-[clamp(1.6rem,3vw,2.2rem)] font-bold leading-[1.2]" style={{ color: "var(--nsk-l-text)" }}>
          {t("brandImageryHeading")}
        </h2>
        <p className="font-body text-[15px] leading-[1.6]" style={{ color: "var(--nsk-l-text-secondary)" }}>
          {t("brandImagerySubtitle")}
        </p>
      </div>
      <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
        {PHOTOS.map((photo, i) => (
          <Reveal key={photo.src} index={i}>
            <div
              className="relative aspect-[4/5] overflow-hidden rounded-card border shadow-[var(--nsk-l-shadow)] transition-all duration-[250ms] ease-nsk hover:-translate-y-1 hover:shadow-[var(--nsk-l-shadow-hover)]"
              style={{ borderColor: "var(--nsk-l-border)" }}
            >
              <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
