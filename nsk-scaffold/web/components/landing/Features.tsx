import { getTranslations } from "next-intl/server";
import { Salad, CalendarClock, TrendingDown, ListChecks } from "lucide-react";
import { PhoneScreen } from "./PhoneScreen";
import { Reveal } from "./Reveal";

export async function Features() {
  const t = await getTranslations("landing");

  const CARDS = [
    {
      icon: TrendingDown,
      title: t("featureWasteReportTitle"),
      body: t("featureWasteReportBody"),
    },
    {
      icon: ListChecks,
      title: t("featureSmartListsTitle"),
      body: t("featureSmartListsBody"),
    },
  ];

  return (
    <div className="mx-auto max-w-content px-6 py-[clamp(40px,6vw,80px)]" id="app-screens">
      <div className="mx-auto mb-16 max-w-[640px] text-center">
        <h2 className="mb-3.5 font-display text-[clamp(1.7rem,3.4vw,2.5rem)] font-bold leading-[1.2]" style={{ color: "var(--nsk-l-text)" }}>
          {t("featuresHeader")}
        </h2>
        <p className="font-body text-base leading-[1.6]" style={{ color: "var(--nsk-l-text-secondary)" }}>
          {t("featuresSub")}
        </p>
      </div>

      <div className="mb-[88px] flex flex-wrap items-center gap-14">
        <div className="min-w-[280px] flex-[1_1_380px]">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-pill border" style={{ borderColor: "var(--nsk-l-border)" }}>
            <Salad size={20} className="text-[var(--nsk-l-accent)]" />
          </div>
          <h3 className="mb-2.5 font-display text-[22px] font-bold" style={{ color: "var(--nsk-l-text)" }}>
            {t("featureRecipesFromPantryTitle")}
          </h3>
          <p className="max-w-[420px] font-body text-[15px] leading-[1.6]" style={{ color: "var(--nsk-l-text-secondary)" }}>
            {t("featureRecipesFromPantryBody")}
          </p>
        </div>
        <div className="flex-none">
          <PhoneScreen variant="ricette" />
        </div>
      </div>

      <div className="mb-[88px] flex flex-wrap-reverse items-center gap-14">
        <div className="flex-none">
          <PhoneScreen variant="dispensa" />
        </div>
        <div className="min-w-[280px] flex-[1_1_380px]">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-pill border" style={{ borderColor: "var(--nsk-l-border)" }}>
            <CalendarClock size={20} className="text-[var(--nsk-l-accent)]" />
          </div>
          <h3 className="mb-2.5 font-display text-[22px] font-bold" style={{ color: "var(--nsk-l-text)" }}>
            {t("featureExpiryTrackingTitle")}
          </h3>
          <p className="max-w-[420px] font-body text-[15px] leading-[1.6]" style={{ color: "var(--nsk-l-text-secondary)" }}>
            {t("featureExpiryTrackingBody")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]">
        {CARDS.map((card, i) => (
          <Reveal key={card.title} index={i}>
            <div
              className="h-full rounded-card border p-7 shadow-[var(--nsk-l-shadow)] transition-all duration-[250ms] ease-nsk hover:-translate-y-1 hover:shadow-[var(--nsk-l-shadow-hover)]"
              style={{ background: "var(--nsk-l-card-bg)", borderColor: "var(--nsk-l-border)" }}
            >
              <div className="mb-[18px] flex h-10 w-10 items-center justify-center rounded-pill border" style={{ borderColor: "var(--nsk-l-border)" }}>
                <card.icon size={18} className="text-[var(--nsk-l-accent)]" />
              </div>
              <h4 className="mb-2 font-display text-lg font-bold" style={{ color: "var(--nsk-l-text)" }}>
                {card.title}
              </h4>
              <p className="font-body text-sm leading-[1.6]" style={{ color: "var(--nsk-l-text-secondary)" }}>
                {card.body}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
