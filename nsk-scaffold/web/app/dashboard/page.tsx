import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NSK_HOME_ITEMS, NSK_PRO_ITEMS } from "@/lib/nav/pillars";
import { SectionBanner } from "@/components/layout/SectionBanner";

const STATUS_LABELS: Record<string, string> = {
  requested: "In attesa di conferma",
  quoted: "Preventivo ricevuto",
  confirmed: "Confermata",
  in_progress: "In corso",
};

// Landing page personale post-login — protetta da middleware.ts. Non è una
// griglia di widget generici: mostra solo ciò che è realmente rilevante ora
// (prossimo impegno, cose da sbrigare) e le due strade principali (N'sK Home
// / N'sK Pro), coerenti col ruolo. Zero dati finti: se non c'è niente da
// mostrare, la sezione semplicemente non appare.
export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  const isPro = profile?.role === "chef" || profile?.role === "admin";
  const firstName = profile?.full_name?.split(" ")[0] ?? "";
  const greeting = getGreeting();

  const bookingsQuery = isPro
    ? supabase.from("bookings").select("id, event_type, event_date, status").eq("chef_id", user.id)
    : supabase.from("bookings").select("id, event_type, event_date, status").eq("customer_id", user.id);

  const { data: upcomingBookings } = await bookingsQuery
    .in("status", ["requested", "quoted", "confirmed", "in_progress"])
    .gte("event_date", new Date().toISOString())
    .order("event_date", { ascending: true })
    .limit(3);

  let newLeadsCount = 0;
  let pendingReviewsCount = 0;

  if (isPro) {
    const { count: leadsCount } = await supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("chef_id", user.id)
      .eq("stage", "new");
    newLeadsCount = leadsCount ?? 0;

    const { count: reviewsCount } = await supabase
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("chef_id", user.id)
      .is("chef_response", null);
    pendingReviewsCount = reviewsCount ?? 0;
  }

  const todos = [
    newLeadsCount > 0 && {
      label: `${newLeadsCount} nuovo/i contatto/i da qualificare`,
      href: "/crm",
    },
    pendingReviewsCount > 0 && {
      label: `${pendingReviewsCount} recensione/i senza risposta`,
      href: "/crm",
    },
  ].filter(Boolean) as Array<{ label: string; href: string }>;

  return (
    <div className="mx-auto max-w-content px-6 py-14">
      <SectionBanner image="/images/marketing/hero-risotto.webp" />
      <p className="font-body text-sm text-ivory/50">{greeting}</p>
      <h1 className="mt-1 font-display text-display-md text-ivory">
        {firstName ? `Ciao, ${firstName}` : "Bentornato"}
      </h1>

      {todos.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-3">
          {todos.map((todo) => (
            <Link
              key={todo.label}
              href={todo.href}
              className="rounded-pill border border-gold/50 bg-gold/10 px-4 py-2 font-body text-sm text-ivory transition hover:bg-gold/20"
            >
              {todo.label}
            </Link>
          ))}
        </div>
      )}

      {upcomingBookings && upcomingBookings.length > 0 && (
        <section className="mt-12">
          <h2 className="font-body text-xs uppercase tracking-widest text-ivory/50">
            Prossimi impegni
          </h2>
          <div className="mt-4 space-y-3">
            {upcomingBookings.map((b) => (
              <Link
                key={b.id}
                href="/bookings"
                className="flex items-center justify-between rounded-card border border-line bg-white px-6 py-4 shadow-soft transition hover:shadow-card"
              >
                <div>
                  <p className="font-body text-sm font-medium text-charcoal">{b.event_type ?? "Evento"}</p>
                  <p className="mt-0.5 font-body text-xs text-mist">
                    {new Date(b.event_date).toLocaleString("it-IT", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
                <span className="rounded-pill bg-cream px-3 py-1 font-body text-xs text-smoke">
                  {STATUS_LABELS[b.status] ?? b.status}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-12">
        <h2 className="font-body text-xs uppercase tracking-widest text-ivory/50">N&apos;sK Home</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {NSK_HOME_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-card border border-line bg-white p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card"
            >
              <p className="font-display text-lg text-charcoal">{item.label}</p>
              <p className="mt-2 font-body text-sm text-smoke">{item.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {isPro ? (
        <section className="mt-12">
          <h2 className="font-body text-xs uppercase tracking-widest text-ivory/50">N&apos;sK Pro</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {NSK_PRO_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-card border border-line bg-white p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card"
              >
                <p className="font-display text-lg text-charcoal">{item.label}</p>
                <p className="mt-2 font-body text-sm text-smoke">{item.description}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <section className="mt-12 rounded-panel border border-line bg-white p-10">
          <p className="font-display text-xl text-charcoal">Cerchi uno chef per un evento?</p>
          <p className="mt-2 max-w-lg font-body text-sm text-smoke">
            Nel marketplace trovi chef privati verificati per cene, corsi e consulenza.
          </p>
          <Link
            href="/chefs"
            className="mt-5 inline-block rounded-pill bg-charcoal px-6 py-3 font-body text-sm text-ivory transition hover:bg-gold hover:text-charcoal"
          >
            Esplora il marketplace
          </Link>
        </section>
      )}
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return "Buonanotte";
  if (hour < 12) return "Buongiorno";
  if (hour < 18) return "Buon pomeriggio";
  return "Buonasera";
}
