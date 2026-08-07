import Image from "next/image";
import { getTranslations } from "next-intl/server";

type Variant = "overview" | "dispensa" | "ricette" | "report" | "lista";

const TEAL = "#117E8E";
const AMBER_GOLD = "rgba(200,169,107,"; // riusa il gold del brand per le barre report, come da spec
const WARN = "oklch(60% 0.12 25)";
const OK = "oklch(70% 0.09 150)";

// Device frame + 5 varianti di contenuto, spec pixel-close (vedi
// design_handoff_nsk_landing/PhoneScreen.dc.html). Presentational, dati
// hardcoded come nel prototipo — non collegato a dati reali dell'utente.
// I nomi degli ingredienti/ricette e le etichette sono tradotti (namespace
// "landing") cosi il mockup segue la lingua selezionata dal visitatore.
export async function PhoneScreen({ variant }: { variant: Variant }) {
  const t = await getTranslations("landing");

  const overviewItems = [
    { name: t("ingredientZucca"), exp: t("expInDays", { count: 2 }), color: TEAL },
    { name: t("ingredientSalvia"), exp: t("expInDays", { count: 3 }), color: OK },
    { name: t("ingredientRicotta"), exp: t("expToday"), color: WARN },
    { name: t("ingredientRisoCarnaroli"), exp: t("expInDays", { count: 40 }), color: OK },
  ];

  const pantryFilters = [
    { label: t("phoneFilterAll"), active: true },
    { label: t("phoneFilterExpiring"), active: false },
    { label: t("phoneFilterFresh"), active: false },
  ];

  const pantryItems = [
    { name: t("ingredientRicotta"), exp: t("expToday"), color: WARN },
    { name: t("ingredientZucca"), exp: t("expInDays", { count: 2 }), color: WARN },
    { name: t("ingredientSalvia"), exp: t("expInDays", { count: 3 }), color: TEAL },
    { name: t("ingredientBurro"), exp: t("expInDays", { count: 9 }), color: TEAL },
    { name: t("ingredientRisoCarnaroli"), exp: t("expInDays", { count: 40 }), color: OK },
    { name: t("ingredientParmigiano"), exp: t("expInDays", { count: 25 }), color: OK },
  ];

  const recipeItems = [
    { name: t("recipeRisotto"), meta: t("recipeMeta", { minutes: 25, count: 5 }), match: "92%", img: "/images/landing/recipe-thumb-1.webp" },
    { name: t("recipeRavioli"), meta: t("recipeMeta", { minutes: 35, count: 3 }), match: "81%", img: "/images/landing/recipe-thumb-2.webp" },
    { name: t("recipeBurroSalvia"), meta: t("recipeMeta", { minutes: 10, count: 2 }), match: "74%", img: "/images/landing/recipe-thumb-1.webp" },
  ];

  const reportBars = [
    { label: t("reportWeekLabel", { n: 1 }), h: 40, opacity: 0.35 },
    { label: t("reportWeekLabel", { n: 2 }), h: 58, opacity: 0.5 },
    { label: t("reportWeekLabel", { n: 3 }), h: 46, opacity: 0.4 },
    { label: t("reportWeekLabel", { n: 4 }), h: 70, opacity: 0.65 },
    { label: t("reportWeekLabel", { n: 5 }), h: 85, opacity: 1, teal: true },
    { label: t("reportWeekLabel", { n: 6 }), h: 95, opacity: 1, teal: true },
  ];

  const shoppingGroups = [
    { category: t("categoryOrtaggi"), items: [t("ingredientZucchine"), t("ingredientCarote")] },
    { category: t("categoryLatticini"), items: [t("ingredientRicotta"), t("ingredientParmigiano")] },
    { category: t("categoryDispensa"), items: [t("ingredientRisoCarnaroli"), t("ingredientOlioEvo")] },
  ];

  return (
    <div
      className="relative box-border rounded-[44px] bg-black p-[10px] shadow-elevated"
      style={{ width: 280, height: 580 }}
    >
      <div className="absolute left-1/2 top-[22px] z-10 h-[18px] w-[70px] -translate-x-1/2 rounded-pill bg-black" />
      <div
        className="box-border flex h-full w-full flex-col gap-3.5 overflow-hidden rounded-[34px] px-[18px] pb-5 pt-[34px]"
        style={{ background: "#1B2C44" }}
      >
        {variant === "overview" && (
          <>
            <div className="flex items-baseline justify-between">
              <div className="font-display text-xl font-bold text-ivory">{t("phoneOverviewTitle")}</div>
              <div className="flex h-[34px] w-[34px] items-center justify-center rounded-pill bg-teal font-body text-xs font-bold text-white">
                -28%
              </div>
            </div>
            <div className="font-body text-[10px] font-medium uppercase tracking-[0.04em] text-ivory/50">
              {t("phoneOverviewReducedLabel")}
            </div>
            <div className="h-px bg-ivory/10" />
            <div className="flex flex-col gap-2">
              {overviewItems.map((it) => (
                <div
                  key={it.name}
                  className="flex items-center gap-2.5 rounded-xl border border-ivory/10 px-3 py-[9px]"
                  style={{ background: "#22344F" }}
                >
                  <div className="h-2 w-2 flex-none rounded-pill" style={{ background: it.color }} />
                  <div className="flex-1 font-body text-[13px] font-medium text-ivory">{it.name}</div>
                  <div className="font-body text-[10px] font-medium text-ivory/60">{it.exp}</div>
                </div>
              ))}
            </div>
            <div className="h-px bg-ivory/10" />
            <div className="font-body text-[11px] font-semibold uppercase tracking-[0.04em] text-ivory/70">
              {t("phoneOverviewSuggestedLabel")}
            </div>
            <div className="flex items-center gap-2.5 rounded-2xl border border-ivory/10 p-3" style={{ background: "#22344F" }}>
              <Image
                src="/images/landing/recipe-thumb-1.webp"
                alt=""
                width={44}
                height={44}
                className="h-11 w-11 flex-none rounded-xl object-cover"
              />
              <div className="flex-1">
                <div className="font-body text-[13px] font-bold text-ivory">{t("recipeRisotto")}</div>
                <div className="mt-0.5 font-body text-[10px] font-medium text-ivory/55">
                  {t("phoneOverviewSuggestionBody", { count: 5 })}
                </div>
              </div>
            </div>
          </>
        )}

        {variant === "dispensa" && (
          <>
            <div className="font-display text-xl font-bold text-ivory">{t("phoneDispensaTitle")}</div>
            <div className="rounded-pill border border-ivory/10 px-3.5 py-2 font-body text-xs font-medium text-ivory/50" style={{ background: "#22344F" }}>
              {t("phoneSearchPlaceholder")}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {pantryFilters.map((f) => (
                <div
                  key={f.label}
                  className="rounded-pill border border-ivory/10 px-3 py-[5px] font-body text-[10px] font-semibold"
                  style={{ background: f.active ? TEAL : "transparent", color: f.active ? "#FFFFFF" : "rgba(245,241,234,.7)" }}
                >
                  {f.label}
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2 overflow-hidden">
              {pantryItems.map((it) => (
                <div key={it.name} className="flex items-center gap-2.5 border-b border-ivory/[0.08] px-0.5 py-2">
                  <div className="h-[7px] w-[7px] flex-none rounded-pill" style={{ background: it.color }} />
                  <div className="flex-1 font-body text-[13px] font-medium text-ivory">{it.name}</div>
                  <div className="font-body text-[10px] font-semibold" style={{ color: it.color }}>
                    {it.exp}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {variant === "ricette" && (
          <>
            <div className="font-display text-xl font-bold text-ivory">{t("phoneRicetteTitle")}</div>
            <div className="font-body text-[11px] font-medium text-ivory/55">{t("phoneRicetteSubtitle")}</div>
            <div className="mt-1 flex flex-col gap-2.5">
              {recipeItems.map((r) => (
                <div key={r.name} className="flex items-center gap-2.5 rounded-2xl border border-ivory/10 p-[11px]" style={{ background: "#22344F" }}>
                  <Image src={r.img} alt="" width={46} height={46} className="h-[46px] w-[46px] flex-none rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="font-body text-[13px] font-bold text-ivory">{r.name}</div>
                    <div className="mt-0.5 font-body text-[10px] font-medium text-ivory/55">{r.meta}</div>
                  </div>
                  <div className="flex-none rounded-pill bg-teal px-2 py-1 font-body text-[10px] font-bold text-white">
                    {r.match}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {variant === "report" && (
          <>
            <div className="font-display text-xl font-bold text-ivory">{t("phoneReportTitle")}</div>
            <div className="font-body text-[11px] font-medium text-ivory/55">{t("phoneReportSubtitle")}</div>
            <div className="mt-0.5 flex items-baseline gap-1.5">
              <div className="font-display text-[34px] font-bold text-teal">-31%</div>
              <div className="font-body text-[11px] font-medium text-ivory/55">{t("phoneReportVsLastMonth")}</div>
            </div>
            <div className="mt-2 flex h-[120px] items-end gap-2">
              {reportBars.map((b) => (
                <div key={b.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                  <div
                    className="w-full rounded-t-md"
                    style={{
                      height: `${b.h}%`,
                      background: b.teal ? TEAL : `${AMBER_GOLD}${b.opacity})`,
                    }}
                  />
                  <div className="font-body text-[9px] font-semibold text-ivory/45">{b.label}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {variant === "lista" && (
          <>
            <div className="font-display text-xl font-bold text-ivory">{t("phoneListaTitle")}</div>
            <div className="font-body text-[11px] font-medium text-ivory/55">
              {t("phoneListaSubtitle")}
            </div>
            {shoppingGroups.map((g) => (
              <div key={g.category} className="mt-1.5">
                <div className="mb-1.5 font-body text-[10px] font-semibold uppercase tracking-[0.06em] text-teal">
                  {g.category}
                </div>
                <div className="flex flex-col gap-[7px]">
                  {g.items.map((item) => (
                    <div key={item} className="flex items-center gap-2.5">
                      <div className="h-4 w-4 flex-none rounded-[5px] border-[1.5px] border-ivory/35" />
                      <div className="font-body text-[13px] font-medium text-ivory">{item}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
