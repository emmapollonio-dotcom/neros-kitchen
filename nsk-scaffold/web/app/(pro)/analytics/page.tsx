import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SocialStudio } from "@/components/social/SocialStudio";
import { TabSwitcher } from "@/components/layout/TabSwitcher";
import { SectionBanner } from "@/components/layout/SectionBanner";

// Protetta da middleware.ts (/analytics). Legge dalla view v_booking_revenue
// (schema.sql, Step 4) — nessuna aggregazione duplicata lato applicazione.
// "Social Studio" è confluita qui come tab: performance e contenuti per farla
// crescere sono la stessa domanda ("come va il mio business"), non due strumenti.
export default async function AnalyticsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: revenueByMonth } = await supabase
    .from("v_booking_revenue")
    .select("month, bookings_count, revenue")
    .eq("chef_id", user?.id)
    .order("month", { ascending: false })
    .limit(12);

  const { count: pendingCount } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("chef_id", user?.id)
    .eq("status", "requested");

  const { data: reviews } = await supabase
    .from("chefs")
    .select("rating_avg, rating_count")
    .eq("id", user?.id)
    .single();

  const totalRevenue = (revenueByMonth ?? []).reduce((sum, r) => sum + Number(r.revenue ?? 0), 0);
  const totalBookings = (revenueByMonth ?? []).reduce((sum, r) => sum + Number(r.bookings_count ?? 0), 0);

  const performanceContent = (
    <div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Kpi label="Revenue (12 mesi)" value={`${totalRevenue.toFixed(0)} €`} />
        <Kpi label="Prenotazioni completate" value={String(totalBookings)} />
        <Kpi label="Richieste in attesa" value={String(pendingCount ?? 0)} />
        <Kpi label="Rating medio" value={reviews?.rating_avg ? `★ ${reviews.rating_avg}` : "—"} />
      </div>

      <h2 className="mt-10 font-display text-lg text-ivory">Revenue per mese</h2>
      <div className="mt-4 overflow-hidden rounded-card border border-line bg-white shadow-soft">
        <table className="w-full font-body text-sm">
          <thead>
            <tr className="border-b border-line bg-cream text-left text-mist">
              <th className="px-5 py-3 font-normal">Mese</th>
              <th className="px-5 py-3 font-normal">Prenotazioni</th>
              <th className="px-5 py-3 font-normal">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {(revenueByMonth ?? []).map((r) => (
              <tr key={r.month} className="border-b border-line last:border-0">
                <td className="px-5 py-3 text-charcoal">
                  {new Date(r.month).toLocaleDateString("it-IT", { month: "long", year: "numeric" })}
                </td>
                <td className="px-5 py-3 text-charcoal">{r.bookings_count}</td>
                <td className="px-5 py-3 text-charcoal">{Number(r.revenue).toFixed(2)} €</td>
              </tr>
            ))}
            {(!revenueByMonth || revenueByMonth.length === 0) && (
              <tr>
                <td colSpan={3} className="px-5 py-8 text-center text-smoke">
                  Nessun dato ancora — arriverà dopo la prima prenotazione completata e pagata.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-content px-6 py-14 text-ivory">
      <SectionBanner image="/images/marketing/dining-event.webp" />
      <p className="font-body text-sm uppercase tracking-widest text-gold">N&apos;sK Pro</p>
      <h1 className="mt-2 font-display text-display-md text-ivory">Analytics</h1>

      <div className="mt-10">
        <TabSwitcher
          tabs={[
            { id: "performance", label: "Performance", content: performanceContent },
            { id: "social", label: "Social Studio", content: <SocialStudio /> },
          ]}
        />
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-line bg-white p-5 shadow-soft">
      <p className="font-body text-xs uppercase tracking-wide text-mist">{label}</p>
      <p className="mt-2 font-display text-2xl text-charcoal">{value}</p>
    </div>
  );
}
