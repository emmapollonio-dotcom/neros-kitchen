"use server";

import { invokeAgent } from "@/lib/ai/agent-client";

export type TutorState = { response: string | null; error: string | null };

export async function askChefAssistant(
  _prev: TutorState,
  formData: FormData
): Promise<TutorState> {
  const question = String(formData.get("question") ?? "").trim();
  if (!question) return { response: null, error: "Scrivi una domanda." };

  const result = await invokeAgent("chef_assistant", question);

  if (result.error || !result.data) {
    return { response: null, error: result.error ?? "Errore imprevisto." };
  }

  return { response: result.data.response, error: null };
}
