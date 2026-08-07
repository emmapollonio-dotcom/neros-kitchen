"use client";

import { useActionState } from "react";
import { askChefAssistant, type TutorState } from "@/app/(home)/tutor-ai/actions";

const initialState: TutorState = { response: null, error: null };

const PROMPT_IDEAS = [
  "Come adatto questo risotto per 12 persone senza glutine?",
  "Con cosa posso sostituire il burro in una frolla?",
  "Idee menu degustazione 5 portate, stagione autunno.",
];

// Estratto da tutor-ai/page.tsx per permettere alla pagina di diventare un
// Server Component con TabSwitcher (Chef Assistant + Corsi, ex Academy).
export function ChefAssistantForm() {
  const [state, formAction, pending] = useActionState(askChefAssistant, initialState);

  return (
    <div className="max-w-2xl">
      <p className="font-body text-sm text-smoke">
        Sostituzioni ingredienti, adattamento ricette, idee menu — chiedi pure, in qualsiasi lingua.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {PROMPT_IDEAS.map((idea) => (
          <span
            key={idea}
            className="rounded-pill border border-line bg-white px-3 py-1.5 font-body text-xs text-mist"
          >
            {idea}
          </span>
        ))}
      </div>

      <form action={formAction} className="mt-6 space-y-4">
        <textarea
          name="question"
          rows={4}
          required
          placeholder="Es. Come posso adattare questa ricetta di risotto per 12 persone senza glutine?"
          className="w-full rounded-card border border-line bg-white px-4 py-3 font-body text-sm text-charcoal placeholder:text-mist focus:border-teal focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-pill bg-charcoal px-6 py-3 font-body text-sm text-ivory transition hover:bg-teal hover:text-white disabled:opacity-50"
        >
          {pending ? "Sto pensando..." : "Chiedi"}
        </button>
      </form>

      {state.error && <p className="mt-6 font-body text-sm text-red-600">{state.error}</p>}

      {state.response && (
        <div className="mt-8 whitespace-pre-wrap rounded-card border border-teal/40 bg-teal/10 p-6 font-body text-sm text-white shadow-soft">
          {state.response}
        </div>
      )}
    </div>
  );
}
