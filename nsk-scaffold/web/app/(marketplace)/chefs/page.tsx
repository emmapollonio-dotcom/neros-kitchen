import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ChefListClient } from "@/components/marketplace/ChefListClient";
import { SectionBanner } from "@/components/layout/SectionBanner";

export const dynamic = "force-dynamic";

// Pagina pubblica (SEO-friendly, nessuna auth richiesta) — la vista
// v_chef_public_profile espone solo i campi pensati per essere pubblici,
// niente dati sensibili o interni.
export default async function ChefsMarketplacePage() {
  const t = await getTranslations("marketplace");
  const supabase = await createSupabaseServerClient();
  const { data: chefs } = await supabase
    .from("v_chef_public_profile")
    .select("*")
    .order("rating_avg", { ascending: false, nullsFirst: false });

  return (
    <div className="mx-auto max-w-content px-6 py-14">
      <SectionBanner image="/images/marketing/chef-plating.webp" />
      <p className="font-body text-sm uppercase tracking-widest text-teal">Marketplace</p>
      <h1 className="mt-2 font-display text-display-md text-shell-fg">{t("findYourChef")}</h1>
      <p className="mt-3 max-w-xl font-body text-shell-fg-secondary">{t("subtitle")}</p>

      <div className="mt-10">
        {chefs && chefs.length > 0 ? (
          <ChefListClient chefs={chefs} />
        ) : (
          <div className="rounded-panel border border-line bg-white p-12 text-center">
            <p className="font-display text-xl text-charcoal">{t("emptyTitle")}</p>
            <p className="mx-auto mt-2 max-w-md font-body text-sm text-smoke">{t("emptyBody")}</p>
            <Link
              href="/signup"
              className="mt-6 inline-block rounded-pill bg-teal px-6 py-3 font-body text-sm text-white transition hover:bg-teal-dark"
            >
              {t("joinAsChef")}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
