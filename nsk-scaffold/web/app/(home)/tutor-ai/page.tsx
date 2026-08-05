"use client";

import { useActionState } from "react";
import { askChefAssistant, type TutorState } from "./actions";

const initialState: TutorState = { response: null, error: null };

export default function TutorAiPage() {
  const [state, formAction, pending] = useActionState(askChefAssistant, initialState);

  return (
    <div className="min-h-screen bg-ivory px-6 py-16 text-charcoal">
      <div className="mx-auto max-w-2xl">
        <p className="font-body text-sm uppercase tracking-widest text-gold">Tutor AI</p>
        <h1 className="mt-2 font-display text-3xl">Chiedi al Chef Assistant</h1>
        <p className="mt-2 font-body text-sm text-smoke">
          Sostituzioni ingredienti, adattamento ricette, idee menu — chiedi pure.
        </p>

        <form action={formAction} className="mt-8 space-y-4">
          <textarea
            name="question"
            rows={4}
            required
            placeholder="Es. Come posso adattare questa ricetta di risotto per 12 persone senza glutine?"
            className="w-full rounded-nsk border border-smoke/30 bg-white px-4 py-3 font-body"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-nsk bg-charcoal px-6 py-3 font-body text-ivory hover:bg-gold hover:text-charcoal disabled:opacity-50"
          >
            {pending ? "Sto pensando..." : "Chiedi"}
          </button>
        </form>

        {state.error && (
          <p className="mt-6 font-body text-sm text-red-600">{state.error}</p>
        )}

        {state.response && (
          <div className="mt-8 whitespace-pre-wrap rounded-nsk border border-gold/40 bg-gold/10 p-6 font-body text-sm text-charcoal">
            {state.response}
          </div>
        )}
      </div>
    </div>
  );
}
