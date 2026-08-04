import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";

// Ogni tool riceve il client Supabase creato con il JWT dell'utente chiamante
// (non service role): le RLS policy di schema.sql restano l'unica autorizzazione
// reale, l'agente non può leggere/scrivere nulla che l'utente non potrebbe già.
export type ToolContext = { supabase: SupabaseClient; userId: string };

export async function searchIngredients(ctx: ToolContext, args: { query: string }) {
  const { data, error } = await ctx.supabase
    .from("ingredients")
    .select("id, name, default_unit, avg_cost_per_unit")
    .ilike("name", `%${args.query}%`)
    .limit(10);

  if (error) return { error: error.message };
  return { ingredients: data };
}

export async function createRecipeDraft(
  ctx: ToolContext,
  args: { title: string; servings: number; description?: string }
) {
  const slug = `${args.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${crypto
    .randomUUID()
    .slice(0, 8)}`;

  const { data, error } = await ctx.supabase
    .from("recipes")
    .insert({
      owner_id: ctx.userId,
      title: args.title,
      servings: args.servings,
      description: args.description ?? null,
      slug,
      visibility: "private",
    })
    .select()
    .single();

  if (error) return { error: error.message };
  return { recipe: data };
}

// NOTA: questa è una duplicazione intenzionale e minima della logica in
// web/lib/food-cost/calculate.ts. Le Edge Function Deno e l'app Next.js sono
// deploy target separati in questo scaffold "starter": in un monorepo maturo
// (Turborepo/Nx) questa funzione andrebbe estratta in un package condiviso
// `@nsk/food-cost-core` importato da entrambi, per evitare che le due
// implementazioni divergano nel tempo. Segnalato qui esplicitamente perché è
// un rischio di manutenzione reale, non un dettaglio trascurabile.
export async function calculateFoodCost(ctx: ToolContext, args: { recipe_id: string }) {
  const { data: recipe, error: recipeError } = await ctx.supabase
    .from("recipes")
    .select("id, servings, food_cost_total")
    .eq("id", args.recipe_id)
    .single();

  if (recipeError || !recipe) return { error: "ricetta non trovata o non accessibile" };

  const { data: lines, error: linesError } = await ctx.supabase
    .from("recipe_ingredients")
    .select("quantity, ingredient_id, ingredients(avg_cost_per_unit)")
    .eq("recipe_id", args.recipe_id);

  if (linesError) return { error: linesError.message };

  let total = 0;
  for (const line of lines ?? []) {
    const unitCost = Number((line as any).ingredients?.avg_cost_per_unit ?? 0);
    total += unitCost * Number(line.quantity);
  }

  const perServing = recipe.servings > 0 ? total / recipe.servings : 0;

  return {
    food_cost_total: Number(total.toFixed(2)),
    food_cost_per_serving: Number(perServing.toFixed(3)),
    servings: recipe.servings,
  };
}

export async function getChefAvailability(ctx: ToolContext, args: { chef_id: string }) {
  const { data, error } = await ctx.supabase
    .from("chef_availability")
    .select("id, start_at, end_at")
    .eq("chef_id", args.chef_id)
    .eq("is_booked", false)
    .gt("start_at", new Date().toISOString())
    .order("start_at", { ascending: true })
    .limit(10);

  if (error) return { error: error.message };
  return { available_slots: data };
}

export async function getChefPricing(ctx: ToolContext, args: { chef_id: string }) {
  const { data, error } = await ctx.supabase
    .from("v_chef_public_profile")
    .select("hourly_rate, event_min_price")
    .eq("id", args.chef_id)
    .single();

  if (error) return { error: error.message };
  return data;
}

// Match esatto per nome (case-insensitive via ilike) sul catalogo ingredients.
// Se non trova nulla ritorna known: false — il system prompt istruisce
// l'agente a non citare importi in quel caso, invece di stimarli a caso.
export async function searchIngredientCost(ctx: ToolContext, args: { ingredient_name: string }) {
  const { data, error } = await ctx.supabase
    .from("ingredients")
    .select("name, avg_cost_per_unit, default_unit")
    .ilike("name", args.ingredient_name)
    .limit(1)
    .maybeSingle();

  if (error) return { error: error.message };
  if (!data) return { known: false };

  return {
    known: true,
    name: data.name,
    avg_cost_per_unit: Number(data.avg_cost_per_unit ?? 0),
    unit: data.default_unit,
  };
}

// L'agente chiama questo tool una volta per suggerimento (systemPrompt in
// agents.ts lo impone esplicitamente): niente testo libero non persistito.
// RLS "waste_suggestions_owner" verifica che waste_item_id appartenga
// all'utente corrente prima di permettere l'insert.
export async function saveWasteSuggestion(
  ctx: ToolContext,
  args: {
    waste_item_id: string;
    suggestion_type: string;
    title: string;
    content: string;
    sustainability_score: number;
  }
) {
  const score = Math.max(0, Math.min(100, Math.round(args.sustainability_score)));

  const { data, error } = await ctx.supabase
    .from("waste_suggestions")
    .insert({
      waste_item_id: args.waste_item_id,
      suggestion_type: args.suggestion_type,
      title: args.title,
      content: args.content,
      sustainability_score: score,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  return { suggestion: data };
}

// RLS "social_posts_owner" verifica che post_id appartenga all'utente
// corrente prima di permettere l'update. Sovrascrive anche lo status a
// "ready": un post con caption e hashtag salvati è pronto per la revisione
// umana, non più un draft vuoto.
export async function saveSocialContent(
  ctx: ToolContext,
  args: { post_id: string; caption: string; hashtags: string[] }
) {
  const { data, error } = await ctx.supabase
    .from("social_posts")
    .update({
      caption: args.caption,
      hashtags: args.hashtags,
      status: "ready",
      updated_at: new Date().toISOString(),
    })
    .eq("id", args.post_id)
    .select()
    .single();

  if (error) return { error: error.message };
  return { post: data };
}

// RLS "haccp_corrective_actions_owner" verifica che reading_id appartenga
// (tramite haccp_readings.user_id) all'utente corrente prima di permettere
// l'insert.
export async function saveCorrectiveAction(
  ctx: ToolContext,
  args: { reading_id: string; title: string; content: string; urgency: string }
) {
  const { data, error } = await ctx.supabase
    .from("haccp_corrective_actions")
    .insert({
      reading_id: args.reading_id,
      title: args.title,
      content: args.content,
      urgency: args.urgency,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  return { action: data };
}

export const TOOL_IMPLEMENTATIONS: Record<
  string,
  (ctx: ToolContext, args: any) => Promise<unknown>
> = {
  search_ingredients: searchIngredients,
  create_recipe_draft: createRecipeDraft,
  calculate_food_cost: calculateFoodCost,
  get_chef_availability: getChefAvailability,
  get_chef_pricing: getChefPricing,
  search_ingredient_cost: searchIngredientCost,
  save_waste_suggestion: saveWasteSuggestion,
  save_social_content: saveSocialContent,
  save_corrective_action: saveCorrectiveAction,
};
