import Link from "next/link";
import { redirect } from "next/navigation";
import { ChefHat, Sparkles, TrendingUp, UtensilsCrossed } from "lucide-react";
import { getCurrentUserInfo } from "@/lib/auth/get-current-user";

export const dynamic = "force-dynamic";

const PILLARS = [
  {
    icon: ChefHat,
    name: "Marketplace",
    desc: "Chef privati verificati per cene, eventi e corsi — richiedi, ricevi il preventivo, paghi solo dopo la conferma.",
    href: "/chefs",
  },
  {
    icon: UtensilsCrossed,
    name: "N'sK Home",
    desc: "Ricette con food cost calcolato, meal planner, lista della spesa automatica, zero waste, tutor AI.",
    href: "/signup",
  },
  {
    icon: TrendingUp,
    name: "N'sK Pro",
    desc: "Food cost, HACCP, CRM, analytics e academy — gli strumenti di gestione per chi vive di cucina.",
    href: "/signup",
  },
];

export default async function HomePage() {
  const user = await getCurrentUserInfo();
  if (user) redirect("/dashboard");

  return (
    <>
      <section className="mx-auto max-w-4xl px-6 py-28 text-center">
        <p className="font-body text-sm uppercase tracking-[0.2em] text-gold">
          Per chef, ristoranti, catering e scuole di cucina
        </p>
        <h1 className="mt-5 font-display text-display-xl text-charcoal">
          L&apos;ecosistema che gestisce il tuo business in cucina
        </h1>
        <p className="mx-auto mt-6 max-w-xl font-body text-lg text-smoke">
          Prenotazioni, food cost, riduzione sprechi e formazione — tutto in un unico posto,
          pensato per chi la cucina la vive ogni giorno.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="rounded-pill bg-charcoal px-8 py-3.5 font-body text-ivory transition hover:bg-gold hover:text-charcoal"
          >
            Inizia gratis
          </Link>
          <Link
            href="/pricing"
            className="rounded-pill border border-line px-8 py-3.5 font-body text-charcoal transition hover:border-gold"
          >
            Vedi i piani
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-content px-6 pb-24">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {PILLARS.map((p) => (
            <Link
              key={p.name}
              href={p.href}
              className="group rounded-panel border border-line bg-white p-8 shadow-soft transition hover:-translate-y-1 hover:shadow-elevated"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-pill bg-cream text-charcoal transition group-hover:bg-gold/20">
                <p.icon size={22} />
              </div>
              <h3 className="mt-6 font-display text-xl text-charcoal">{p.name}</h3>
              <p className="mt-3 font-body text-sm leading-relaxed text-smoke">{p.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-cream">
        <div className="mx-auto max-w-content px-6 py-24">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-pill bg-gold/15 text-gold-dark">
                <Sparkles size={22} />
              </div>
              <h2 className="mt-6 font-display text-display-md text-charcoal">
                Intelligenza artificiale che lavora davvero
              </h2>
              <p className="mt-4 max-w-md font-body text-smoke">
                Non un chatbot generico: agenti dedicati per calcolare food cost, suggerire
                ricette dagli scarti, rilevare allergeni, generare contenuti social e rispondere
                alle recensioni. Sempre con un umano che verifica prima di applicare.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                "Food cost & pricing",
                "Zero waste",
                "Rilevamento allergeni",
                "Tutor AI personalizzato",
                "Social media studio",
                "Risposte alle recensioni",
              ].map((f) => (
                <div key={f} className="rounded-card border border-line bg-white p-4 shadow-soft">
                  <p className="font-body text-sm text-charcoal">{f}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-content px-6 py-24 text-center">
        <h2 className="font-display text-display-md text-charcoal">Pronto a iniziare?</h2>
        <p className="mx-auto mt-3 max-w-md font-body text-smoke">
          Gratis per iniziare, nessuna carta richiesta. Passa a Pro quando il business cresce.
        </p>
        <Link
          href="/signup"
          className="mt-8 inline-block rounded-pill bg-charcoal px-10 py-4 font-body text-ivory transition hover:bg-gold hover:text-charcoal"
        >
          Crea il tuo account
        </Link>
      </section>
    </>
  );
}
