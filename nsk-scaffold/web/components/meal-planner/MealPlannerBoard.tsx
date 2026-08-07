"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { Plus, X } from "lucide-react";
import { getWeekDates, shiftWeek } from "@/lib/meal-plan/week";
import { MEAL_SLOTS, type MealSlot } from "@/lib/validators/meal-plan";

interface RecipeOption {
  id: string;
  title: string;
  servings: number;
}

interface Entry {
  id: string;
  recipe_id: string;
  day_date: string;
  meal_slot: MealSlot;
  servings: number;
  recipe: { id: string; title: string; servings: number } | null;
}

interface Props {
  mealPlanId: string;
  weekStart: string;
  entries: Entry[];
  recipes: RecipeOption[];
}

export function MealPlannerBoard({ mealPlanId, weekStart, entries: initialEntries, recipes }: Props) {
  const t = useTranslations("mealPlanner");
  const locale = useLocale();
  const router = useRouter();
  const [entries, setEntries] = useState(initialEntries);
  const [addingFor, setAddingFor] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState<string | null>(null);

  const days = getWeekDates(weekStart);

  function goToWeek(deltaWeeks: number) {
    router.push(`/meal-planner?week=${shiftWeek(weekStart, deltaWeeks)}`);
  }

  async function addEntry(dayDate: string, recipeId: string, mealSlot: MealSlot, servings: number) {
    const res = await fetch(`/api/v1/meal-plans/${mealPlanId}/entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipe_id: recipeId, day_date: dayDate, meal_slot: mealSlot, servings }),
    });
    if (res.ok) {
      const { data } = await res.json();
      setEntries((prev) => [...prev, data]);
      setAddingFor(null);
    }
  }

  async function removeEntry(entryId: string) {
    setEntries((prev) => prev.filter((e) => e.id !== entryId));
    await fetch(`/api/v1/meal-plans/${mealPlanId}/entries/${entryId}`, { method: "DELETE" });
  }

  async function generateShoppingList() {
    setGenerating(true);
    setGeneratedMessage(null);
    const res = await fetch(`/api/v1/meal-plans/${mealPlanId}/generate-shopping-list`, {
      method: "POST",
    });
    setGenerating(false);
    if (res.ok) {
      router.push("/lista-spesa");
    } else {
      const body = await res.json();
      setGeneratedMessage(typeof body.error === "string" ? body.error : t("generateListError"));
    }
  }

  const slotLabels: Record<MealSlot, string> = {
    breakfast: t("slotBreakfast"),
    lunch: t("slotLunch"),
    dinner: t("slotDinner"),
    snack: t("slotSnack"),
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => goToWeek(-1)}
            className="rounded-pill border border-line px-4 py-2 font-body text-sm text-charcoal hover:border-teal"
          >
            {t("prevWeek")}
          </button>
          <button
            onClick={() => goToWeek(1)}
            className="rounded-pill border border-line px-4 py-2 font-body text-sm text-charcoal hover:border-teal"
          >
            {t("nextWeek")}
          </button>
        </div>

        <button
          onClick={generateShoppingList}
          disabled={generating || entries.length === 0}
          className="rounded-pill bg-teal px-5 py-2.5 font-body text-sm text-white transition hover:bg-teal-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          {generating ? t("generating") : t("generateList")}
        </button>
      </div>

      {generatedMessage && (
        <p className="mt-3 font-body text-sm text-red-600" role="alert">
          {generatedMessage}
        </p>
      )}

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-7">
        {days.map((day) => {
          const dayEntries = entries.filter((e) => e.day_date === day);
          const isAdding = addingFor === day;

          return (
            <div key={day} className="rounded-card border border-line bg-white p-4 shadow-soft">
              <p className="font-body text-xs uppercase tracking-wide text-mist">
                {new Date(day + "T00:00:00").toLocaleDateString(locale, { weekday: "short" })}
              </p>
              <p className="font-display text-lg text-charcoal">
                {new Date(day + "T00:00:00").getDate()}
              </p>

              <div className="mt-3 space-y-2">
                {dayEntries.map((entry) => (
                  <div key={entry.id} className="group relative rounded-nsk bg-cream p-2.5">
                    <button
                      onClick={() => removeEntry(entry.id)}
                      className="absolute right-1 top-1 rounded-full p-0.5 text-mist opacity-0 transition hover:text-charcoal group-hover:opacity-100"
                      aria-label={t("removeAria")}
                    >
                      <X size={13} />
                    </button>
                    <p className="pr-4 font-body text-xs text-mist">{slotLabels[entry.meal_slot]}</p>
                    <p className="font-body text-sm text-charcoal">
                      {entry.recipe?.title ?? t("defaultRecipe")}
                    </p>
                    <p className="font-body text-xs text-mist">{t("servings", { count: entry.servings })}</p>
                  </div>
                ))}
              </div>

              {isAdding ? (
                <AddEntryForm
                  recipes={recipes}
                  slotLabels={slotLabels}
                  t={t}
                  onAdd={(recipeId, slot, servings) => addEntry(day, recipeId, slot, servings)}
                  onCancel={() => setAddingFor(null)}
                />
              ) : (
                <button
                  onClick={() => setAddingFor(day)}
                  disabled={recipes.length === 0}
                  className="mt-3 flex w-full items-center justify-center gap-1 rounded-nsk border border-dashed border-line py-2 font-body text-xs text-smoke transition hover:border-teal hover:text-teal-dark disabled:cursor-not-allowed disabled:text-mist disabled:opacity-80"
                >
                  <Plus size={13} />
                  {t("add")}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {recipes.length === 0 && (
        <p className="mt-6 font-body text-sm text-smoke">
          {t("noRecipesYet")}{" "}
          <Link href="/ricette/nuova" className="underline hover:text-teal-dark">
            {t("createOne")}
          </Link>
          .
        </p>
      )}
    </div>
  );
}

function AddEntryForm({
  recipes,
  slotLabels,
  t,
  onAdd,
  onCancel,
}: {
  recipes: RecipeOption[];
  slotLabels: Record<MealSlot, string>;
  t: ReturnType<typeof useTranslations>;
  onAdd: (recipeId: string, slot: MealSlot, servings: number) => void;
  onCancel: () => void;
}) {
  const [recipeId, setRecipeId] = useState(recipes[0]?.id ?? "");
  const [slot, setSlot] = useState<MealSlot>("dinner");
  const [servings, setServings] = useState(recipes[0]?.servings ?? 2);

  return (
    <div className="mt-3 space-y-2 rounded-nsk border border-line p-2.5">
      <select
        value={recipeId}
        onChange={(e) => setRecipeId(e.target.value)}
        className="w-full rounded-nsk border border-line bg-white px-2 py-1.5 font-body text-xs text-charcoal"
      >
        {recipes.map((r) => (
          <option key={r.id} value={r.id}>
            {r.title}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        <select
          value={slot}
          onChange={(e) => setSlot(e.target.value as MealSlot)}
          className="flex-1 rounded-nsk border border-line bg-white px-2 py-1.5 font-body text-xs text-charcoal"
        >
          {MEAL_SLOTS.map((s) => (
            <option key={s} value={s}>
              {slotLabels[s]}
            </option>
          ))}
        </select>
        <input
          type="number"
          min={1}
          value={servings}
          onChange={(e) => setServings(Number(e.target.value))}
          className="w-16 rounded-nsk border border-line bg-white px-2 py-1.5 font-body text-xs text-charcoal"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => recipeId && onAdd(recipeId, slot, servings)}
          className="flex-1 rounded-nsk bg-teal py-1.5 font-body text-xs text-white hover:bg-teal-dark"
        >
          {t("add")}
        </button>
        <button onClick={onCancel} className="rounded-nsk px-3 font-body text-xs text-mist hover:text-charcoal">
          {t("cancel")}
        </button>
      </div>
    </div>
  );
}
