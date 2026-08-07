import { getLocale, getTranslations } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Protetta da middleware.ts. RLS ("bookings_participants") filtra automaticamente
// solo le prenotazioni dove l'utente è customer_id o chef_id — nessun filtro
// aggiuntivo necessario qui lato applicazione.
export default async function BookingsPage() {
  const t = await getTranslations("bookings");
  const locale = await getLocale();
  const STATUS_LABELS: Record<string, string> = {
    requested: t("statusRequested"),
    quoted: t("statusQuoted"),
    confirmed: t("statusConfirmed"),
    in_progress: t("statusInProgress"),
    completed: t("statusCompleted"),
    cancelled: t("statusCancelled"),
    disputed: t("statusDisputed"),
  };
  const supabase = await createSupabaseServerClient();
  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, event_type, event_date, status, quote_amount, currency")
    .order("event_date", { ascending: true });

  return (
    <div className="min-h-screen bg-shell px-6 py-16 text-shell-fg">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl">{t("title")}</h1>

        {(!bookings || bookings.length === 0) && (
          <p className="mt-6 font-body text-shell-fg-secondary">{t("noBookingsYet")}</p>
        )}

        <ul className="mt-8 space-y-4">
          {(bookings ?? []).map((b) => (
            <li
              key={b.id}
              className="flex items-center justify-between rounded-nsk border border-smoke/15 bg-card p-5"
            >
              <div>
                <p className="font-body font-medium text-card-fg">{b.event_type}</p>
                <p className="font-body text-sm text-card-fg-secondary">
                  {new Date(b.event_date).toLocaleString(locale, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
              <div className="text-right">
                <span className="rounded-nsk bg-teal/20 px-3 py-1 font-body text-xs text-teal-dark">
                  {STATUS_LABELS[b.status] ?? b.status}
                </span>
                {b.quote_amount && (
                  <p className="mt-1 font-body text-sm text-card-fg-secondary">
                    {b.quote_amount} {b.currency}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
