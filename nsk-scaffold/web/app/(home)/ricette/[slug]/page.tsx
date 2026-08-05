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
      "id, title, slug, description, servings, category, cuisine, difficulty, allergens, allergen_notes, owner_id, visibility"
    )
    .eq("slug", slug)
    .single();

  if (!recipe) return notFound();

  const isOwner = user?.id === recipe.owner_id;
  if (recipe.visibility !== "public" && !isOwner) return notFound();

  const { data: ingredientLines } = await supabase
    .from("recipe_ingredients")
    .select("id, quantity, unit, ingredients(name)")
    .eq("recipe_id", recipe.id)
    .order("position", { ascending: true });

  return (
    <div className="min-h-screen bg-ivory px-6 py-16 text-charcoal">
      <div className="mx-auto max-w-3xl">
        <RecipeDetail
          recipe={recipe}
          ingredients={(ingredientLines ?? []).map((line) => ({
            id: line.id,
            name: (line as unknown as { ingredients: { name: string } | null }).ingredients?.name ?? "ingrediente",
            quantity: line.quantity,
            unit: line.unit,
          }))}
          isOwner={isOwner}
        />
      </div>
    </div>
  );
}
