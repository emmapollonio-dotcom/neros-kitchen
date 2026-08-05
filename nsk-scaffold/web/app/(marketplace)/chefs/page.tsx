import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ChefListClient } from "@/components/marketplace/ChefListClient";
import { SectionBanner } from "@/components/layout/SectionBanner";

export const dynamic = "force-dynamic";

// Pagina pubblica (SEO-friendly, nessuna auth richiesta) — la vista
// v_chef_public_profile espone solo i campi pensati per essere pubblici,
// niente dati sensibili o interni.
export default async function ChefsMarketplacePage() {
  const supabase = await createSupabaseServerClient();
  const { data: chefs } = await supabase
    .from("v_chef_public_profile")
    .select("*")
    .order("rating_avg", { ascending: false, nullsFirst: false });

  return (
    <div className="mx-auto max-w-content px-6 py-14">
      <SectionBanner image="/images/marketing/chef-plating.webp" />
      <p className="font-body text-sm uppercase tracking-widest text-gold">Marketplace</p>
      <h1 className="mt-2 font-display text-display-md text-ivory">Trova il tuo chef</h1>
      <p className="mt-3 max-w-xl font-body text-ivory/70">
        Chef privati verificati per cene, eventi, corsi di cucina e consulenza — scegli, richiedi
        disponibilità, paga solo dopo la conferma.
      </p>

      <div className="mt-10">
        {chefs && chefs.length > 0 ? (
          <ChefListClient chefs={chefs} />
        ) : (
          <div className="rounded-panel border border-line bg-white p-12 text-center">
            <p className="font-display text-xl text-charcoal">Stiamo accogliendo i primi chef</p>
            <p className="mx-auto mt-2 max-w-md font-body text-sm text-smoke">
              Il marketplace è appena nato — nuovi chef verificati arrivano ogni settimana. Sei
              uno chef professionista? Unisciti come tra i primi.
            </p>
            <Link
              href="/signup"
              className="mt-6 inline-block rounded-pill bg-charcoal px-6 py-3 font-body text-sm text-ivory transition hover:bg-gold hover:text-charcoal"
            >
              Iscriviti come chef
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
