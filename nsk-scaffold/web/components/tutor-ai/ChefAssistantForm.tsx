"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { askChefAssistant, type TutorState } from "@/app/(home)/tutor-ai/actions";

const initialState: TutorState = { response: null, error: null };

// Estratto da tutor-ai/page.tsx per permettere alla pagina di diventare un
// Server Component con TabSwitcher (Chef Assistant + Corsi, ex Academy).
export function ChefAssistantForm() {
  const t = useTranslations("tutorAi");
  const [state, formAction, pending] = useActionState(askChefAssistant, initialState);
  const promptIdeas = [t("promptIdea1"), t("promptIdea2"), t("promptIdea3")];

  return (
    <div className="max-w-2xl">
      <p className="font-body text-sm text-card-fg-secondary">{t("assistantHelp")}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {promptIdeas.map((idea) => (
          <span
            key={idea}
            className="rounded-pill border border-card-border bg-card px-3 py-1.5 font-body text-xs text-card-fg-muted"
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
          placeholder={t("questionPlaceholder")}
          className="w-full rounded-card border border-card-border bg-card px-4 py-3 font-body text-sm text-card-fg placeholder:text-card-fg-muted focus:border-teal focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-pill bg-teal px-6 py-3 font-body text-sm text-white transition hover:bg-teal-dark disabled:opacity-50"
        >
          {pending ? t("thinking") : t("ask")}
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
