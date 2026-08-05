// N'sK Agent Orchestrator — Supabase Edge Function (Deno)
// Deploy: supabase functions deploy agent-orchestrator
// Chiamata da web/lib/ai/agent-client.ts con il JWT dell'utente autenticato.
//
// Flusso (vedi Step 8 del documento di architettura):
//  1. Verifica il JWT e recupera il ruolo utente da public.profiles
//  2. Controlla che il ruolo possa usare l'agente richiesto (AGENTS[name].allowedRoles)
//  3. Chiama OpenAI con i tool dell'agente (function calling)
//  4. Esegue i tool richiesti usando un client Supabase con il JWT dell'utente
//     (mai service role qui: le RLS restano l'unica autorizzazione sui dati)
//  5. Rimanda il risultato dei tool al modello per la risposta finale
//  6. Logga input/output/latency in public.ai_logs
//  7. Ritorna { data, error, meta } come le altre API v1

import { createClient } from "jsr:@supabase/supabase-js@2";
import { AGENTS, type AgentName } from "./agents.ts";
import { TOOL_IMPLEMENTATIONS, type ToolContext } from "./tools.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;
const MAX_TOOL_ROUNDTRIPS = 4;

Deno.serve(async (req: Request) => {
  const startedAt = Date.now();

  if (req.method !== "POST") {
    return jsonResponse({ data: null, error: "method_not_allowed", meta: null }, 405);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return jsonResponse({ data: null, error: "unauthorized", meta: null }, 401);
  }

  let body: { agent_name?: string; input?: string };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ data: null, error: "invalid_json", meta: null }, 400);
  }

  const agentName = body.agent_name as AgentName;
  const userInput = body.input;

  if (!agentName || !AGENTS[agentName] || !userInput) {
    return jsonResponse(
      { data: null, error: "agent_name (valido) e input sono obbligatori", meta: null },
      400
    );
  }

  // Client "per-utente": il token JWT nella richiesta determina auth.uid() lato Postgres,
  // quindi le RLS filtrano automaticamente i dati come farebbero per una normale API call.
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return jsonResponse({ data: null, error: "unauthorized", meta: null }, 401);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (profile?.role as "customer" | "chef" | "admin") ?? "customer";
  const agent = AGENTS[agentName];

  if (!agent.allowedRoles.includes(role)) {
    return jsonResponse(
      { data: null, error: `l'agente ${agentName} non è disponibile per il ruolo ${role}`, meta: null },
      403
    );
  }

  // Rate limiting: protegge dai costi OpenAI in caso di abuso/loop.
  // Due finestre indipendenti: una stretta anti-burst (chiamate ravvicinate,
  // es. un loop bacato lato client) e una oraria più larga per l'uso normale.
  const burstOk = await checkRateLimit(supabase, `ai_burst:${user.id}`, 6, 60);
  if (!burstOk) {
    return jsonResponse(
      { data: null, error: "troppe richieste in poco tempo, riprova tra qualche secondo", meta: null },
      429
    );
  }
  const hourlyOk = await checkRateLimit(supabase, `ai_hourly:${user.id}`, 30, 3600);
  if (!hourlyOk) {
    return jsonResponse(
      { data: null, error: "hai raggiunto il limite di richieste AI per quest'ora, riprova più tardi", meta: null },
      429
    );
  }

  const toolCtx: ToolContext = { supabase, userId: user.id };

  const messages: any[] = [
    { role: "system", content: agent.systemPrompt },
    { role: "user", content: userInput },
  ];

  let finalContent = "";
  let totalTokens = 0;

  try {
    for (let round = 0; round < MAX_TOOL_ROUNDTRIPS; round++) {
      const completion = await callOpenAI(messages, agent.tools);
      totalTokens += completion.usage?.total_tokens ?? 0;

      const choice = completion.choices[0];
      const toolCalls = choice.message.tool_calls;

      if (!toolCalls || toolCalls.length === 0) {
        finalContent = choice.message.content ?? "";
        break;
      }

      messages.push(choice.message);

      for (const call of toolCalls) {
        const impl = TOOL_IMPLEMENTATIONS[call.function.name];
        const args = JSON.parse(call.function.arguments || "{}");
        const result = impl ? await impl(toolCtx, args) : { error: "unknown_tool" };

        messages.push({
          role: "tool",
          tool_call_id: call.id,
          content: JSON.stringify(result),
        });
      }
    }
  } catch (e) {
    await logAiCall(supabase, user.id, agentName, userInput, null, 0, Date.now() - startedAt);
    return jsonResponse(
      { data: null, error: `agent_error: ${(e as Error).message}`, meta: null },
      500
    );
  }

  const latencyMs = Date.now() - startedAt;
  await logAiCall(supabase, user.id, agentName, userInput, finalContent, totalTokens, latencyMs);

  return jsonResponse({
    data: { response: finalContent },
    error: null,
    meta: { agent: agentName, tokens_used: totalTokens, latency_ms: latencyMs },
  });
});

async function callOpenAI(messages: any[], tools: any[]) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      tools,
      tool_choice: "auto",
      temperature: 0.4,
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI API error: ${res.status} ${await res.text()}`);
  }

  return res.json();
}

async function logAiCall(
  supabase: any,
  userId: string,
  agentName: string,
  input: string,
  output: string | null,
  tokens: number,
  latencyMs: number
) {
  await supabase.from("ai_logs").insert({
    user_id: userId,
    agent_name: agentName,
    input: { text: input },
    output: output ? { text: output } : null,
    tokens_used: tokens,
    latency_ms: latencyMs,
  });
}

// Wrapper attorno a public.check_rate_limit (SECURITY DEFINER, vedi migration
// add_rate_limiting): fail-open se l'RPC stessa fallisce, per non bloccare
// utenti legittimi a causa di un problema infrastrutturale del rate limiter.
async function checkRateLimit(
  supabase: any,
  key: string,
  maxRequests: number,
  windowSeconds: number
): Promise<boolean> {
  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_key: key,
    p_max_requests: maxRequests,
    p_window_seconds: windowSeconds,
  });
  if (error) {
    console.error("rate_limit_check_failed", error);
    return true;
  }
  return data === true;
}

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
