import { createSupabaseServerClient } from "@/lib/supabase/server";

// Protetta da middleware.ts (/pro). Legge dalla view v_booking_revenue
// (schema.sql, Step 4) — nessuna aggregazione duplicata lato applicazione.
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

  return (
    <div className="min-h-screen bg-ivory px-6 py-16 text-charcoal">
      <div className="mx-auto max-w-4xl">
        <p className="font-body text-sm uppercase tracking-widest text-gold">N&apos;sK Pro</p>
        <h1 className="mt-2 font-display text-3xl">Analytics</h1>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Kpi label="Revenue (12 mesi)" value={`${totalRevenue.toFixed(0)} €`} />
          <Kpi label="Prenotazioni completate" value={String(totalBookings)} />
          <Kpi label="Richieste in attesa" value={String(pendingCount ?? 0)} />
          <Kpi label="Rating medio" value={reviews?.rating_avg ? `★ ${reviews.rating_avg}` : "—"} />
        </div>

        <h2 className="mt-12 font-display text-xl">Revenue per mese</h2>
        <table className="mt-4 w-full font-body text-sm">
          <thead>
            <tr className="border-b border-smoke/20 text-left text-smoke">
              <th className="py-2">Mese</th>
              <th className="py-2">Prenotazioni</th>
              <th className="py-2">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {(revenueByMonth ?? []).map((r) => (
              <tr key={r.month} className="border-b border-smoke/10">
                <td className="py-2">
                  {new Date(r.month).toLocaleDateString("it-IT", {
                    month: "long",
                    year: "numeric",
                  })}
                </td>
                <td className="py-2">{r.bookings_count}</td>
                <td className="py-2">{Number(r.revenue).toFixed(2)} €</td>
              </tr>
            ))}
            {(!revenueByMonth || revenueByMonth.length === 0) && (
              <tr>
                <td colSpan={3} className="py-6 text-center text-smoke">
                  Nessun dato ancora — arriverà dopo la prima prenotazione completata e pagata.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-nsk border border-smoke/15 bg-white p-5">
      <p className="font-body text-xs uppercase tracking-wide text-smoke">{label}</p>
      <p className="mt-2 font-display text-2xl text-charcoal">{value}</p>
    </div>
  );
}
