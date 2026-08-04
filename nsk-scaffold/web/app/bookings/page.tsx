import { createSupabaseServerClient } from "@/lib/supabase/server";

const STATUS_LABELS: Record<string, string> = {
  requested: "In attesa di conferma",
  quoted: "Preventivo ricevuto",
  confirmed: "Confermata",
  in_progress: "In corso",
  completed: "Completata",
  cancelled: "Annullata",
  disputed: "In contestazione",
};

// Protetta da middleware.ts. RLS ("bookings_participants") filtra automaticamente
// solo le prenotazioni dove l'utente è customer_id o chef_id — nessun filtro
// aggiuntivo necessario qui lato applicazione.
export default async function BookingsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, event_type, event_date, status, quote_amount, currency")
    .order("event_date", { ascending: true });

  return (
    <main className="min-h-screen bg-ivory px-6 py-16 text-charcoal">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl">Le tue prenotazioni</h1>

        {(!bookings || bookings.length === 0) && (
          <p className="mt-6 font-body text-smoke">Nessuna prenotazione ancora.</p>
        )}

        <ul className="mt-8 space-y-4">
          {(bookings ?? []).map((b) => (
            <li
              key={b.id}
              className="flex items-center justify-between rounded-nsk border border-smoke/15 bg-white p-5"
            >
              <div>
                <p className="font-body font-medium text-charcoal">{b.event_type}</p>
                <p className="font-body text-sm text-smoke">
                  {new Date(b.event_date).toLocaleString("it-IT", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
              <div className="text-right">
                <span className="rounded-nsk bg-gold/20 px-3 py-1 font-body text-xs text-charcoal">
                  {STATUS_LABELS[b.status] ?? b.status}
                </span>
                {b.quote_amount && (
                  <p className="mt-1 font-body text-sm text-smoke">
                    {b.quote_amount} {b.currency}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
