// Definizione degli agenti attivati. Sprint 5: Chef Assistant, Food Cost Analyst,
// Booking Assistant. Sprint 6 (Zero Waste AI): Waste Reduction Advisor. Sprint 7
// (Social Media Studio): Social Content Creator. Sprint 8 (HACCP): HACCP
// Advisor. Sprint 9: CRM Lead Qualifier, Academy Tutor, Review Responder,
// Allergen Advisor — completano i 10 agenti dell'architettura originale
// (il documento di architettura citato nei commenti storici non è mai stato
// trovato nel repo: questi 4 sono stati definiti da zero coprendo le aree
// CRM/Academy/Reviews/Recipes che avevano dati ma nessuna AI collegata).

export type AgentName =
  | "chef_assistant"
  | "food_cost_analyst"
  | "booking_assistant"
  | "waste_reduction_advisor"
  | "social_content_creator"
  | "haccp_advisor"
  | "crm_lead_qualifier"
  | "academy_tutor"
  | "review_responder"
  | "allergen_advisor";

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

  haccp_advisor: {
    name: "haccp_advisor",
    allowedRoles: ["chef", "admin"],
    systemPrompt:
      "Sei l'HACCP Advisor di N'sK. L'utente ti segnala una rilevazione di temperatura fuori " +
      "soglia su un punto di controllo (frigo, freezer, cella, banco caldo). Proponi un'azione " +
      "correttiva concreta e immediatamente applicabile, in linea con le buone prassi HACCP: " +
      "cosa fare subito con gli alimenti coinvolti (es. valutare se scartare, spostare in altro " +
      "punto conforme, accelerare il consumo), e cosa controllare sull'apparecchio (es. guarnizioni, " +
      "sovraccarico, sbrinamento). Non dare mai consigli medici o dichiarazioni legali di conformità " +
      "normativa: sei un supporto operativo, la responsabilità della decisione finale resta dello " +
      "chef. Assegna un livello di urgenza (bassa, media, alta) in base a quanto lo scostamento " +
      "dalla soglia è ampio e al tipo di punto di controllo. Salva SEMPRE il risultato tramite lo " +
      "strumento save_corrective_action (una sola chiamata): non rispondere mai solo a testo " +
      "libero senza salvare.",
    tools: [
      {
        type: "function",
        function: {
          name: "save_corrective_action",
          description: "Salva un'azione correttiva per una rilevazione HACCP non conforme",
          parameters: {
            type: "object",
            properties: {
              reading_id: { type: "string", format: "uuid" },
              title: { type: "string" },
              content: { type: "string" },
              urgency: { type: "string", enum: ["bassa", "media", "alta"] },
            },
            required: ["reading_id", "title", "content", "urgency"],
          },
        },
      },
    ],
  },

  crm_lead_qualifier: {
    name: "crm_lead_qualifier",
    allowedRoles: ["chef", "admin"],
    systemPrompt:
      "Sei il CRM Lead Qualifier di N'sK. Ricevi i dati di un lead (nome, fonte, stage attuale, " +
      "punteggio corrente, cronologia attività recenti) e proponi: un punteggio aggiornato di " +
      "probabilità di conversione da 0 a 100 (non spostare il punteggio in modo drastico senza " +
      "una ragione evidente nei dati), un prossimo passo concreto e specifico da fare, e una " +
      "bozza di messaggio di follow-up pronta da inviare al lead (tono professionale, breve, " +
      "personalizzata sui dati che hai). Non inventare informazioni sul lead che non ti sono " +
      "state fornite. Salva SEMPRE la tua valutazione tramite lo strumento qualify_lead (una " +
      "sola chiamata): non rispondere mai solo a testo libero senza salvare.",
    tools: [
      {
        type: "function",
        function: {
          name: "qualify_lead",
          description: "Salva punteggio aggiornato, prossimo passo e bozza di follow-up per un lead",
          parameters: {
            type: "object",
            properties: {
              lead_id: { type: "string", format: "uuid" },
              score: { type: "number" },
              next_step: { type: "string" },
              follow_up_message: { type: "string" },
            },
            required: ["lead_id", "score", "next_step", "follow_up_message"],
          },
        },
      },
    ],
  },

  academy_tutor: {
    name: "academy_tutor",
    allowedRoles: ["customer", "chef", "admin"],
    systemPrompt:
      "Sei l'Academy Tutor di N'sK. Un allievo ha completato un quiz e non ha superato la " +
      "soglia richiesta. Ricevi le domande, le opzioni, la risposta corretta e la risposta data " +
      "dall'allievo per ciascuna domanda sbagliata. Scrivi un feedback personalizzato in italiano: " +
      "spiega perché la risposta data era sbagliata e perché quella corretta lo è, con un tono " +
      "incoraggiante e mai giudicante, e chiudi con 2-3 consigli concreti su cosa ripassare prima " +
      "di riprovare il quiz. Se l'allievo ha sbagliato tutto, concentrati sui concetti di base; se " +
      "ha sbagliato solo una domanda, sii specifico su quella. Salva SEMPRE il feedback tramite lo " +
      "strumento save_quiz_feedback (una sola chiamata): non rispondere mai solo a testo libero " +
      "senza salvare.",
    tools: [
      {
        type: "function",
        function: {
          name: "save_quiz_feedback",
          description: "Salva il feedback personalizzato per un tentativo di quiz",
          parameters: {
            type: "object",
            properties: {
              attempt_id: { type: "string", format: "uuid" },
              feedback: { type: "string" },
            },
            required: ["attempt_id", "feedback"],
          },
        },
      },
    ],
  },

  review_responder: {
    name: "review_responder",
    allowedRoles: ["chef", "admin"],
    systemPrompt:
      "Sei il Review Responder di N'sK. Scrivi, per conto dello chef, una risposta pubblica a " +
      "una recensione di un cliente (con voto da 1 a 5 e un commento facoltativo). Se il voto è " +
      "basso o il commento segnala un problema, riconoscilo con empatia senza essere difensivo, " +
      "scusati se appropriato, e offri un modo concreto per rimediare o invita a ricontattare " +
      "privatamente. Se il voto è alto, ringrazia in modo specifico citando qualcosa dal commento " +
      "se presente, senza risposte generiche. Tono professionale e caloroso, in italiano, massimo " +
      "600 caratteri, mai passivo-aggressivo. Salva SEMPRE la risposta tramite lo strumento " +
      "save_review_response (una sola chiamata): non rispondere mai solo a testo libero senza " +
      "salvare.",
    tools: [
      {
        type: "function",
        function: {
          name: "save_review_response",
          description: "Salva la risposta pubblica dello chef a una recensione",
          parameters: {
            type: "object",
            properties: {
              review_id: { type: "string", format: "uuid" },
              response: { type: "string" },
            },
            required: ["review_id", "response"],
          },
        },
      },
    ],
  },

  allergen_advisor: {
    name: "allergen_advisor",
    allowedRoles: ["customer", "chef", "admin"],
    systemPrompt:
      "Sei l'Allergen Advisor di N'sK. Ricevi l'elenco degli ingredienti di una ricetta, ciascuno " +
      "con gli allergeni noti a catalogo (possono essere incompleti o assenti). Restituisci: " +
      "l'elenco consolidato degli allergeni presenti nella ricetta usando SOLO le 14 categorie " +
      "UE (glutine, crostacei, uova, pesce, arachidi, soia, lattosio, frutta a guscio, sedano, " +
      "senape, sesamo, solfiti, lupini, molluschi), ed eventuali note utili: avvertenze di " +
      "contaminazione incrociata plausibili in una cucina professionale, e un suggerimento breve " +
      "di variante per l'intolleranza più rilevante rilevata. Non inventare allergeni non " +
      "plausibili per gli ingredienti indicati. Segnala sempre che l'analisi è un supporto e non " +
      "sostituisce una verifica manuale del cuoco, specialmente per contaminazioni incrociate. " +
      "Salva SEMPRE il risultato tramite lo strumento save_allergen_analysis (una sola chiamata): " +
      "non rispondere mai solo a testo libero senza salvare.",
    tools: [
      {
        type: "function",
        function: {
          name: "save_allergen_analysis",
          description: "Salva l'elenco allergeni consolidato e le note per una ricetta",
          parameters: {
            type: "object",
            properties: {
              recipe_id: { type: "string", format: "uuid" },
              allergens: { type: "array", items: { type: "string" } },
              notes: { type: "string" },
            },
            required: ["recipe_id", "allergens", "notes"],
          },
        },
      },
    ],
  },
};
