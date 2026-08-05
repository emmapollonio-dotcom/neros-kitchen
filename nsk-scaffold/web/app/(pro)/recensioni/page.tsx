import { ReviewResponder } from "@/components/reviews/ReviewResponder";

// Protetta da middleware.ts (/recensioni richiede ruolo chef/admin — RLS
// "reviews_chef_respond" impone comunque quel vincolo per ogni scrittura
// anche bypassando la UI).
export default function RecensioniPage() {
  return (
    <div className="min-h-screen bg-ivory px-6 py-16 text-charcoal">
      <div className="mx-auto max-w-3xl">
        <p className="font-body text-sm uppercase tracking-widest text-gold">N&apos;sK Pro</p>
        <h1 className="mt-2 font-display text-3xl">Recensioni</h1>
        <p className="mt-2 font-body text-sm text-smoke">
          Rispondi alle recensioni dei tuoi clienti — le risposte sono pubbliche e visibili sul
          tuo profilo.
        </p>

        <div className="mt-10">
          <ReviewResponder />
        </div>
      </div>
    </div>
  );
}
