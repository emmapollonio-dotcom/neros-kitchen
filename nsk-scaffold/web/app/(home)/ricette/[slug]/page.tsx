import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { RecipeDetail } from "@/components/recipes/RecipeDetail";

interface Props {
  params: Promise<{ slug: string }>;
}

// Server Component — colma un buco preesistente: dopo il salvataggio,
// /ricette/nuova reindirizzava già a questo URL (`router.push`/ricette/${slug}`)
// ma la pagina non esisteva (404). Mostra anche gli allergeni rilevati
// dall'agente allergen_advisor (bottone visibile solo al proprietario).
export default async function RicettaPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: recipe } = await supabase
    .from("recipes")
    .select(
      "id, title, slug, description, servings, category, cuisine, difficulty, allergens, allergen_notes, owner_id, visibility, images"
    )
    .eq("slug", slug)
    .single();

  if (!recipe) return notFound();

  const isOwner = user?.id === recipe.owner_id;
  if (recipe.visibility !== "public" && !isOwner) return notFound();

  // Query separate + Map, non join embedded: il client Supabase senza tipi
  // generati non distingue relazioni 1:1 da array (convenzione di progetto).
  const { data: ingredientLines } = await supabase
    .from("recipe_ingredients")
    .select("id, ingredient_id, quantity, unit")
    .eq("recipe_id", recipe.id)
    .order("position", { ascending: true });

  const ingredientIds = [...new Set((ingredientLines ?? []).map((line) => line.ingredient_id))];
  const { data: ingredientRows } = ingredientIds.length
    ? await supabase.from("ingredients").select("id, name").in("id", ingredientIds)
    : { data: [] };
  const ingredientNameById = new Map((ingredientRows ?? []).map((i) => [i.id, i.name]));

  return (
    <div className="mx-auto max-w-3xl px-6 py-14 text-ivory">
      <Link
        href="/ricette"
        className="inline-flex items-center gap-1 font-body text-sm text-ivory/50 transition hover:text-ivory"
      >
        <ChevronLeft size={16} />
        Le tue ricette
      </Link>

      <div className="mt-6">
        <RecipeDetail
          recipe={recipe}
          ingredients={(ingredientLines ?? []).map((line) => ({
            id: line.id,
            name: ingredientNameById.get(line.ingredient_id) ?? "ingrediente",
            quantity: line.quantity,
            unit: line.unit,
          }))}
          isOwner={isOwner}
        />
      </div>
    </div>
  );
}
