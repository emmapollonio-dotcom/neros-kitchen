import Image from "next/image";
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
    image: "/images/marketing/dining-event.webp",
  },
  {
    icon: UtensilsCrossed,
    name: "N'sK Home",
    desc: "Ricette con food cost calcolato, meal planner, lista della spesa automatica, zero waste, tutor AI.",
    href: "/signup?type=cliente",
    image: "/images/marketing/ingredients-flatlay.webp",
  },
  {
    icon: TrendingUp,
    name: "N'sK Pro",
    desc: "Food cost, HACCP, CRM, analytics e academy — gli strumenti di gestione per chi vive di cucina.",
    href: "/signup?type=professionista",
    image: "/images/marketing/chef-plating.webp",
  },
];

// Foto generate con AI come placeholder (public/images/marketing/): da
// sostituire con scatti veri di piatti/eventi non appena disponibili — vedi
// decisione in sessione, nessuna finzione "stock" permanente prevista.
export default async function HomePage() {
  const user = await getCurrentUserInfo();
  if (user) redirect("/dashboard");

  return (
    <>
      <section className="relative overflow-hidden bg-charcoal">
        <Image
          src="/images/marketing/hero-risotto.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/85 to-charcoal/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-transparent" />

        <div className="relative mx-auto max-w-content px-6 py-28 sm:py-36">
          <div className="max-w-xl">
            <p className="font-body text-sm uppercase tracking-[0.2em] text-gold">
              Per chef, ristoranti, catering e scuole di cucina
            </p>
            <h1 className="mt-5 font-display text-display-xl text-ivory">
              L&apos;ecosistema che gestisce il tuo business in cucina
            </h1>
            <p className="mt-6 max-w-lg font-body text-lg text-ivory/80">
              Prenotazioni, food cost, riduzione sprechi e formazione — tutto in un unico posto,
              pensato per chi la cucina la vive ogni giorno.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="rounded-pill bg-gold px-8 py-3.5 text-center font-body font-medium text-charcoal transition hover:bg-ivory"
              >
                Inizia gratis
              </Link>
              <Link
                href="/pricing"
                className="rounded-pill border border-ivory/30 px-8 py-3.5 text-center font-body text-ivory transition hover:border-ivory hover:bg-ivory/10"
              >
                Vedi i piani
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-content px-6 py-24">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {PILLARS.map((p) => (
            <Link
              key={p.name}
              href={p.href}
              className="group relative overflow-hidden rounded-panel shadow-soft transition hover:-translate-y-1 hover:shadow-elevated"
            >
              <div className="relative h-56 w-full">
                <Image
                  src={p.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 33vw, 100vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/20 to-transparent" />
                <div className="absolute flex h-10 w-10 items-center justify-center rounded-pill bg-ivory/90 text-charcoal left-5 top-5">
                  <p.icon size={18} />
                </div>
                <h3 className="absolute bottom-4 left-5 font-display text-xl text-ivory">{p.name}</h3>
              </div>
              <div className="bg-white p-6">
                <p className="font-body text-sm leading-relaxed text-smoke">{p.desc}</p>
              </div>
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

      <section className="relative overflow-hidden bg-charcoal">
        <Image
          src="/images/marketing/dining-event.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-charcoal/60" />
        <div className="relative mx-auto max-w-content px-6 py-24 text-center">
          <h2 className="font-display text-display-md text-ivory">Pronto a iniziare?</h2>
          <p className="mx-auto mt-3 max-w-md font-body text-ivory/75">
            Gratis per iniziare, nessuna carta richiesta. Passa a Pro quando il business cresce.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-block rounded-pill bg-gold px-10 py-4 font-body font-medium text-charcoal transition hover:bg-ivory"
          >
            Crea il tuo account
          </Link>
        </div>
      </section>
    </>
  );
}
