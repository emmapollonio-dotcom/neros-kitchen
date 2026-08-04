import type { MetadataRoute } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Sitemap dinamica: pagine statiche + profili chef verificati + ricette pubbliche.
// SEO è un canale di acquisizione a costo marginale basso per il founder (Step 1.5) —
// indicizzare bene i profili chef e le ricette pubbliche è prioritario.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nskitchen.io";
  const supabase = await createSupabaseServerClient();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, priority: 1 },
    { url: `${baseUrl}/pricing`, priority: 0.8 },
  ];

  const { data: chefs } = await supabase.from("v_chef_public_profile").select("id");
  const chefRoutes: MetadataRoute.Sitemap = (chefs ?? []).map((c) => ({
    url: `${baseUrl}/chefs/${c.id}`,
    priority: 0.7,
  }));

  const { data: recipes } = await supabase
    .from("recipes")
    .select("slug")
    .eq("visibility", "public");
  const recipeRoutes: MetadataRoute.Sitemap = (recipes ?? []).map((r) => ({
    url: `${baseUrl}/ricette/${r.slug}`,
    priority: 0.6,
  }));

  return [...staticRoutes, ...chefRoutes, ...recipeRoutes];
}
