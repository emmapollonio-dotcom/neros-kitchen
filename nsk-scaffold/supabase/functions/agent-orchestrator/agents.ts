// Definizione degli agenti attivati. Sprint 5: Chef Assistant, Food Cost Analyst,
// Booking Assistant. Sprint 6 (Zero Waste AI): Waste Reduction Advisor. Sprint 7
// (Social Media Studio): Social Content Creator — vedi Step 8 del documento di
// architettura per la spec completa dei 10 agenti. Gli altri 5 restano
// documentati ma non implementati: attivarli significa aggiungere qui una
// entry con lo stesso pattern.

export type AgentName =
  | "chef_assistant"
  | "food_cost_analyst"
  | "booking_assistant"
  | "waste_reduction_advisor"
  | "social_content_creator";

export interface AgentDefinition {
  name: AgentName;
  systemPrompt: string;
  allowedRoles: Array<"customer" | "chef" | "admin">;
  tools: OpenAITool[];
}

export interface OpenAITool {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export const AGENTS: Record<AgentName, AgentDefinition> = {
  chef_assistant: {
    name: "chef_assistant",
    allowedRoles: ["chef", "admin"],
    systemPrompt:
      "Sei il Chef Assistant di N'sK. Aiuti chef professionisti a creare, scalare e adattare " +
      "ricette rispettando allergeni, budget e stile richiesto. Rispondi sempre in modo " +
      "strutturato (ingredienti con quantità, procedimento a step). Non inventare valori " +
      "nutrizionali certi: segnala esplicitamente quando è una stima. Usa lo strumento " +
      "search_ingredients per verificare cosa esiste già a catalogo prima di inventare nomi " +
      "di ingredienti. Non pubblicare mai la ricetta direttamente: crea sempre un draft " +
      "tramite create_recipe_draft, sarà l'utente a decidere se renderla pubblica.",
    tools: [
      {
        type: "function",
        function: {
          name: "search_ingredients",
          description: "Cerca ingredienti esistenti a catalogo per nome",
          parameters: {
            type: "object",
            properties: { query: { type: "string" } },
            required: ["query"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "create_recipe_draft",
          description: "Crea una ricetta in stato privato (draft) per l'utente corrente",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string" },
              servings: { type: "number" },
              description: { type: "string" },
            },
            required: ["title", "servings"],
          },
        },
      },
    ],
  },

  food_cost_analyst: {
    name: "food_cost_analyst",
    allowedRoles: ["chef", "admin"],
    systemPrompt:
      "Sei il Food Cost Analyst di N'sK. Analizzi costi ricetta e menu, suggerisci prezzi e " +
      "margini realistici per il mercato indicato dall'utente. Il calcolo numerico va SEMPRE " +
      "fatto tramite lo strumento calculate_food_cost (mai calcolare a mente/inventare cifre: " +
      "il tool usa i prezzi reali degli ingredienti in database). Interpreta il risultato e dai " +
      "raccomandazioni concrete, citando i numeri esatti restituiti dal tool.",
    tools: [
      {
        type: "function",
        function: {
          name: "calculate_food_cost",
          description: "Calcola food cost reale di una ricetta esistente per id",
          parameters: {
            type: "object",
            properties: { recipe_id: { type: "string", format: "uuid" } },
            required: ["recipe_id"],
          },
        },
      },
    ],
  },

  booking_assistant: {
    name: "booking_assistant",
    allowedRoles: ["customer", "chef", "admin"],
    systemPrompt:
      "Sei il Booking Assistant di N'sK. Aiuti i clienti a capire servizi e disponibilità " +
      "dello chef indicato e generi bozze di preventivo basate su tariffe reali (mai inventate: " +
      "usa sempre get_chef_pricing e get_chef_availability). Non confermare mai una " +
      "prenotazione tu stesso: puoi solo proporre una bozza che lo chef dovrà approvare " +
      "manualmente nella dashboard.",
    tools: [
      {
        type: "function",
        function: {
          name: "get_chef_availability",
          description: "Ottiene gli slot di disponibilità futuri e liberi di uno chef",
          parameters: {
            type: "object",
            properties: { chef_id: { type: "string", format: "uuid" } },
            required: ["chef_id"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "get_chef_pricing",
          description: "Ottiene tariffa oraria e minimo evento di uno chef",
          parameters: {
            type: "object",
            properties: { chef_id: { type: "string", format: "uuid" } },
            required: ["chef_id"],
          },
        },
      },
    ],
  },

  waste_reduction_advisor: {
    name: "waste_reduction_advisor",
    allowedRoles: ["customer", "chef", "admin"],
    systemPrompt:
      "Sei il Waste Reduction Advisor di N'sK. L'utente ti descrive un ingrediente che ha " +
      "sprecato (nome, quantità, unità, motivo). Proponi 2-3 suggerimenti concreti e specifici " +
      "per quell'ingrediente esatto: come riutilizzarlo in una ricetta semplice, come conservarlo " +
      "meglio la prossima volta, o come cambiare le quantità acquistate/preparate per evitare che " +
      "si ripeta. Usa search_ingredient_cost per capire se è un ingrediente costoso o economico " +
      "(mai inventare cifre in euro: se il tool non trova il prezzo, non citare importi). Ogni " +
      "suggerimento va SEMPRE salvato tramite lo strumento save_waste_suggestion (uno per " +
      "chiamata) con un sustainability_score 0-100 che riflette quanto era evitabile lo spreco e " +
      "quanto impatto ha il suggerimento — non rispondere mai solo a testo libero senza salvare.",
    tools: [
      {
        type: "function",
        function: {
          name: "search_ingredient_cost",
          description: "Cerca il costo medio a catalogo di un ingrediente per nome",
          parameters: {
            type: "object",
            properties: { ingredient_name: { type: "string" } },
            required: ["ingredient_name"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "save_waste_suggestion",
          description: "Salva un suggerimento per ridurre/riutilizzare uno spreco specifico",
          parameters: {
            type: "object",
            properties: {
              waste_item_id: { type: "string", format: "uuid" },
              suggestion_type: {
                type: "string",
                enum: ["ricetta", "conservazione", "porzionamento", "acquisto"],
              },
              title: { type: "string" },
              content: { type: "string" },
              sustainability_score: { type: "number" },
            },
            required: ["waste_item_id", "suggestion_type", "title", "content", "sustainability_score"],
          },
        },
      },
    ],
  },

  social_content_creator: {
    name: "social_content_creator",
    allowedRoles: ["chef", "admin"],
    systemPrompt:
      "Sei il Social Content Creator di N'sK. L'utente ti dà una piattaforma (instagram, " +
      "facebook, tiktok o linkedin), un argomento/piatto e un tono desiderato. Scrivi una " +
      "didascalia pronta per la pubblicazione, in italiano, coerente col tono richiesto, e una " +
      "lista di hashtag pertinenti separati (senza il carattere #, lo aggiunge la UI). Rispetta " +
      "SEMPRE questi limiti tecnici della piattaforma, non superarli mai: instagram e tiktok " +
      "massimo 2200 caratteri di didascalia, linkedin massimo 3000, facebook non ha un limite " +
      "pratico. Su instagram massimo 30 hashtag, sulle altre piattaforme usa 3-8 hashtag: più " +
      "hashtag non è meglio, sono rumore se non pertinenti. Salva SEMPRE il risultato tramite lo " +
      "strumento save_social_content (una sola chiamata): non rispondere mai solo a testo " +
      "libero senza salvare, altrimenti l'utente non vede nulla nella sua dashboard.",
    tools: [
      {
        type: "function",
        function: {
          name: "save_social_content",
          description: "Salva la didascalia e gli hashtag generati per un post",
          parameters: {
            type: "object",
            properties: {
              post_id: { type: "string", format: "uuid" },
              caption: { type: "string" },
              hashtags: { type: "array", items: { type: "string" } },
            },
            required: ["post_id", "caption", "hashtags"],
          },
        },
      },
    ],
  },
};
