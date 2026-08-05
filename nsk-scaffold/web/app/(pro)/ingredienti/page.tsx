import { IngredientManager } from "@/components/ingredients/IngredientManager";

// Protetta da middleware.ts (/ingredienti richiede ruolo chef/admin — il
// catalogo è condiviso, RLS "ingredients_chef_write" impone comunque quel
// ruolo per ogni scrittura anche bypassando la UI).
export default function IngredientiPage() {
  return (
    <div className="min-h-screen bg-ivory px-6 py-16 text-charcoal">
      <div className="mx-auto max-w-4xl">
        <p className="font-body text-sm uppercase tracking-widest text-gold">N&apos;sK Pro</p>
        <h1 className="mt-2 font-display text-3xl">Catalogo ingredienti</h1>
        <p className="mt-2 font-body text-sm text-smoke">
          I prezzi qui alimentano le stime di Food Cost e Zero Waste. Tienili aggiornati con i
          costi reali dei tuoi fornitori.
        </p>

        <div className="mt-10">
          <IngredientManager />
        </div>
      </div>
    </div>
  );
}
