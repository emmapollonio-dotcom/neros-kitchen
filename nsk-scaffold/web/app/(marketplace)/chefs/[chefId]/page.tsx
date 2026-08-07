import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ chefId: string }>;
}

export const dynamic = "force-dynamic";

// Server Component — profilo pubblico chef, SEO-friendly (SSR). Layout a due
// colonne stile Airbnb: contenuto a sinistra, card di prenotazione "sticky"
// a destra su desktop, in coda su mobile.
export default async function ChefProfilePage({ params }: Props) {
  const t = await getTranslations("marketplace");
  const locale = await getLocale();
  const { chefId } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: chef } = await supabase
    .from("v_chef_public_profile")
    .select("*")
    .eq("id", chefId)
    .single();

  if (!chef) return notFound();

  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, rating, comment, created_at")
    .eq("chef_id", chefId)
    .order("created_at", { ascending: false })
    .limit(20);

  const displayName = chef.business_name ?? chef.full_name;
  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const priceLabel =
    chef.event_min_price != null
      ? `€${chef.event_min_price}`
      : chef.hourly_rate != null
        ? t("priceHourSuffix", { price: chef.hourly_rate })
        : t("onRequest");

  return (
    <div className="mx-auto max-w-content px-6 py-14">
      <div className="flex items-start gap-5">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-pill bg-teal font-display text-xl text-white">
          {initials}
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-display-md text-shell-fg">{displayName}</h1>
            {chef.verified && (
              <span className="rounded-pill bg-teal/15 px-3 py-1 font-body text-xs text-teal">
                {t("verified")}
              </span>
            )}
          </div>
          {chef.rating_count && chef.rating_count > 0 ? (
            <p className="mt-1 font-body text-sm text-shell-fg-secondary">
              ★ {Number(chef.rating_avg).toFixed(1)} · {t("reviewsCountSuffix", { count: chef.rating_count })}
            </p>
          ) : (
            <p className="mt-1 font-body text-sm text-shell-fg-muted">{t("newOnNsk")}</p>
          )}
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="space-y-10 lg:col-span-2">
          {chef.specialties && chef.specialties.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {chef.specialties.map((s: string) => (
                <span key={s} className="rounded-pill bg-cream px-3 py-1.5 font-body text-xs text-smoke">
                  {s}
                </span>
              ))}
            </div>
          )}

          {chef.bio && (
            <div>
              <h2 className="font-display text-lg text-shell-fg">{t("whoIsTitle")}</h2>
              <p className="mt-3 max-w-2xl font-body leading-relaxed text-shell-fg-secondary">{chef.bio}</p>
            </div>
          )}

          {chef.languages && chef.languages.length > 0 && (
            <div>
              <h2 className="font-display text-lg text-shell-fg">{t("languagesTitle")}</h2>
              <p className="mt-2 font-body text-sm text-shell-fg-secondary">{chef.languages.join(", ")}</p>
            </div>
          )}

          <div>
            <h2 className="font-display text-lg text-shell-fg">{t("reviewsTitle")}</h2>
            {(!reviews || reviews.length === 0) ? (
              <p className="mt-3 font-body text-sm text-shell-fg-secondary">{t("noReviewsYet")}</p>
            ) : (
              <ul className="mt-4 space-y-4">
                {reviews.map((r) => (
                  <li key={r.id} className="rounded-card border border-line bg-white p-5 shadow-soft">
                    <p className="font-body text-sm text-teal">{"★".repeat(r.rating)}</p>
                    {r.comment && <p className="mt-2 font-body text-sm text-charcoal">{r.comment}</p>}
                    <p className="mt-2 font-body text-xs text-mist">
                      {new Date(r.created_at).toLocaleDateString(locale)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-panel border border-line bg-white p-7 shadow-card">
            <p className="font-display text-2xl text-charcoal">{priceLabel}</p>
            <p className="font-body text-sm text-mist">{t("startingEstimate")}</p>
            <Link
              href={`/chefs/${chefId}/book`}
              className="mt-6 block rounded-pill bg-teal px-6 py-3 text-center font-body text-sm text-white transition hover:bg-teal-dark"
            >
              {t("requestAvailability")}
            </Link>
            <p className="mt-3 text-center font-body text-xs text-mist">{t("noChargeNow")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
