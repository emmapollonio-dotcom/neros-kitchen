import Link from "next/link";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getNskHomeItems, getNskProItems } from "@/lib/nav/pillars";
import { SectionBanner } from "@/components/layout/SectionBanner";

// Landing page personale post-login — protetta da middleware.ts. Non è una
// griglia di widget generici: mostra solo ciò che è realmente rilevante ora
// (prossimo impegno, cose da sbrigare) e le due strade principali (N'sK Home
// / N'sK Pro), coerenti col ruolo. Zero dati finti: se non c'è niente da
// mostrare, la sezione semplicemente non appare.
export default async function DashboardPage() {
  const t = await getTranslations("dashboard");
  const tp = await getTranslations("pillars");
  const locale = await getLocale();
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

  const STATUS_LABELS: Record<string, string> = {
    requested: t("statusRequested"),
    quoted: t("statusQuoted"),
    confirmed: t("statusConfirmed"),
    in_progress: t("statusInProgress"),
  };

  const isPro = profile?.role === "chef" || profile?.role === "admin";
  const firstName = profile?.full_name?.split(" ")[0] ?? "";
  const greeting = getGreeting(t);

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
      label: t("newLeadsTodo", { count: newLeadsCount }),
      href: "/crm",
    },
    pendingReviewsCount > 0 && {
      label: t("pendingReviewsTodo", { count: pendingReviewsCount }),
      href: "/crm",
    },
  ].filter(Boolean) as Array<{ label: string; href: string }>;

  return (
    <div className="mx-auto max-w-content px-6 py-14">
      <SectionBanner image="/images/marketing/hero-risotto.webp" />
      <p className="font-body text-sm text-shell-fg-muted">{greeting}</p>
      <h1 className="mt-1 font-display text-display-md text-shell-fg">
        {firstName ? t("helloName", { name: firstName }) : t("welcomeBack")}
      </h1>

      {todos.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-3">
          {todos.map((todo) => (
            <Link
              key={todo.label}
              href={todo.href}
              className="rounded-pill border border-teal/50 bg-teal/10 px-4 py-2 font-body text-sm text-shell-fg transition hover:bg-teal/20"
            >
              {todo.label}
            </Link>
          ))}
        </div>
      )}

      {upcomingBookings && upcomingBookings.length > 0 && (
        <section className="mt-12">
          <h2 className="font-body text-xs uppercase tracking-widest text-shell-fg-muted">
            {t("upcomingBookings")}
          </h2>
          <div className="mt-4 space-y-3">
            {upcomingBookings.map((b) => (
              <Link
                key={b.id}
                href="/bookings"
                className="flex items-center justify-between rounded-card border border-line bg-white px-6 py-4 shadow-soft transition hover:shadow-card"
              >
                <div>
                  <p className="font-body text-sm font-medium text-charcoal">{b.event_type ?? t("defaultEventType")}</p>
                  <p className="mt-0.5 font-body text-xs text-mist">
                    {new Date(b.event_date).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" })}
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
        <h2 className="font-body text-xs uppercase tracking-widest text-shell-fg-muted">N&apos;sK Home</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {getNskHomeItems(tp).map((item) => (
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
          <h2 className="font-body text-xs uppercase tracking-widest text-shell-fg-muted">N&apos;sK Pro</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {getNskProItems(tp).map((item) => (
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
          <p className="font-display text-xl text-charcoal">{t("findChefTitle")}</p>
          <p className="mt-2 max-w-lg font-body text-sm text-smoke">{t("findChefBody")}</p>
          <Link
            href="/chefs"
            className="mt-5 inline-block rounded-pill bg-teal px-6 py-3 font-body text-sm text-white transition hover:bg-teal-dark"
          >
            {t("exploreMarketplace")}
          </Link>
        </section>
      )}
    </div>
  );
}

function getGreeting(t: (key: string) => string): string {
  const hour = new Date().getHours();
  if (hour < 6) return t("greetingNight");
  if (hour < 12) return t("greetingMorning");
  if (hour < 18) return t("greetingAfternoon");
  return t("greetingEvening");
}
