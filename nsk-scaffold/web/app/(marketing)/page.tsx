import Link from "next/link";

const MODULES = [
  { name: "Marketplace", desc: "Trova e prenota chef privati verificati per il tuo evento." },
  { name: "Food Cost", desc: "Calcola costi, margini e prezzi di vendita in tempo reale." },
  { name: "Zero Waste AI", desc: "Trasforma gli scarti in nuove ricette, non in rifiuti." },
  { name: "Academy", desc: "Corsi e certificazioni dai migliori professionisti del settore." },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-ivory text-charcoal">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-display text-xl tracking-wide">Nero&apos;s Kitchen</span>
        <nav className="flex items-center gap-6 font-body text-sm">
          <Link href="/pricing" className="text-smoke hover:text-charcoal">
            Prezzi
          </Link>
          <Link href="/login" className="text-smoke hover:text-charcoal">
            Accedi
          </Link>
          <Link
            href="/signup"
            className="rounded-nsk bg-charcoal px-4 py-2 text-ivory hover:bg-gold hover:text-charcoal"
          >
            Inizia gratis
          </Link>
        </nav>
      </header>

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
    </main>
  );
}
