// N'sK Booking Status Notify — Supabase Edge Function (Deno)
// Deploy: supabase functions deploy booking-status-notify --no-verify-jwt
//
// Chiamata da un Database Webhook Supabase su public.bookings (evento
// UPDATE) — non da un client con JWT utente, per questo verify_jwt è
// disattivato e l'autenticazione è invece un header segreto condiviso
// (x-webhook-secret), impostato sia qui come env var sia nella
// configurazione del webhook. Vedi NOTIFICHE-PUSH-SETUP.md per i passaggi.
//
// Invia una push OneSignal ai due partecipanti della prenotazione
// (customer_id, chef_id) quando bookings.status cambia, con un messaggio
// diverso per ciascuno a seconda del nuovo stato. Il payload del webhook
// contiene già record/old_record per intero: non serve nessuna query al
// database, quindi questa funzione non ha bisogno della service role key.

const ONESIGNAL_APP_ID = Deno.env.get("ONESIGNAL_APP_ID")!;
const ONESIGNAL_REST_API_KEY = Deno.env.get("ONESIGNAL_REST_API_KEY")!;
const WEBHOOK_SECRET = Deno.env.get("BOOKING_WEBHOOK_SECRET")!;

interface BookingRow {
  id: string;
  customer_id: string;
  chef_id: string;
  status: string;
  event_type: string | null;
}

interface WebhookPayload {
  type: string;
  table: string;
  record: BookingRow;
  old_record: BookingRow;
}

// Solo gli stati per cui ha senso avvisare quel partecipante specifico —
// alcune transizioni (es. requested->requested non esiste, ma per sicurezza
// un valore assente nella mappa semplicemente non invia nulla).
const CUSTOMER_MESSAGES: Record<string, string> = {
  quoted: "Hai ricevuto un preventivo per la tua prenotazione",
  confirmed: "La tua prenotazione è stata confermata",
  in_progress: "Il tuo evento è in corso",
  completed: "Il tuo evento è stato completato — lascia una recensione!",
  cancelled: "La tua prenotazione è stata annullata",
  disputed: "La tua prenotazione è in contestazione",
};

const CHEF_MESSAGES: Record<string, string> = {
  requested: "Hai ricevuto una nuova richiesta di prenotazione",
  confirmed: "Una prenotazione è stata confermata dal cliente",
  cancelled: "Una prenotazione è stata annullata",
  disputed: "Una prenotazione è in contestazione",
};

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("method_not_allowed", { status: 405 });
  }

  // Fail-closed: se il secret non è ancora configurato (setup OneSignal non
  // completato), WEBHOOK_SECRET è undefined e questo confronto fallisce
  // sempre — la funzione non fa nulla finché non è impostato correttamente.
  if (req.headers.get("x-webhook-secret") !== WEBHOOK_SECRET) {
    return new Response("unauthorized", { status: 401 });
  }

  let payload: WebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response("invalid_json", { status: 400 });
  }

  if (payload.type !== "UPDATE" || payload.table !== "bookings") {
    return new Response("ignored", { status: 200 });
  }

  const { record, old_record } = payload;
  if (!record || !old_record || record.status === old_record.status) {
    return new Response("no_status_change", { status: 200 });
  }

  const sends: Promise<Response>[] = [];

  const customerMessage = CUSTOMER_MESSAGES[record.status];
  if (customerMessage) {
    sends.push(sendPush(record.customer_id, "Nero's Kitchen", customerMessage));
  }

  const chefMessage = CHEF_MESSAGES[record.status];
  if (chefMessage) {
    sends.push(sendPush(record.chef_id, "Nero's Kitchen", chefMessage));
  }

  await Promise.allSettled(sends);

  return new Response("ok", { status: 200 });
});

async function sendPush(externalUserId: string, title: string, body: string) {
  return fetch("https://onesignal.com/api/v1/notifications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${ONESIGNAL_REST_API_KEY}`,
    },
    body: JSON.stringify({
      app_id: ONESIGNAL_APP_ID,
      include_aliases: { external_id: [externalUserId] },
      target_channel: "push",
      headings: { en: title, it: title },
      contents: { en: body, it: body },
    }),
  });
}
