import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserInfo } from "@/lib/auth/get-current-user";

const MODULES = [
  { name: "Marketplace", desc: "Trova e prenota chef privati verificati per il tuo evento." },
  { name: "Food Cost", desc: "Calcola costi, margini e prezzi di vendita in tempo reale." },
  { name: "Zero Waste AI", desc: "Trasforma gli scarti in nuove ricette, non in rifiuti." },
  { name: "Tutor AI & corsi", desc: "Guida personalizzata e formazione dai migliori professionisti." },
];

export default async function HomePage() {
  const user = await getCurrentUserInfo();
  if (user) redirect("/dashboard");

  return (
    <>
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <p className="font-body text-sm uppercase tracking-[0.2em] text-gold">
          Per chef, ristoranti, catering e scuole di cucina
        </p>
        <h1 className="mt-4 font-display text-5xl leading-tight text-charcoal">
          L&apos;ecosistema che gestisce il tuo business in cucina
        </h1>
        <p className="mx-auto mt-6 max-w-xl font-body text-smoke">
          Prenotazioni, food cost, riduzione sprechi e formazione — tutto in un unico posto,
          pensato per chi la cucina la vive ogni giorno.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-nsk bg-charcoal px-8 py-3 font-body text-ivory hover:bg-gold hover:text-charcoal"
          >
            Inizia gratis
          </Link>
          <Link
            href="/pricing"
            className="rounded-nsk border border-smoke/30 px-8 py-3 font-body text-charcoal hover:border-gold"
          >
            Vedi i piani
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {MODULES.map((m) => (
            <div key={m.name} className="rounded-nsk border border-smoke/15 bg-white p-6">
              <h3 className="font-display text-lg text-charcoal">{m.name}</h3>
              <p className="mt-2 font-body text-sm text-smoke">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
