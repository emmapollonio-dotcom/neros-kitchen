import { WasteTracker } from "@/components/waste/WasteTracker";

// Protetta da middleware.ts (/zero-waste richiede utente autenticato,
// qualunque ruolo — feature "zero_waste" del piano home_premium, vedi
// supabase/schema.sql). I dati veri restano comunque dietro RLS
// "waste_items_owner": questa è solo la UX di redirect per anonimi.
export default function ZeroWastePage() {
  return (
    <div className="min-h-screen bg-ivory px-6 py-16 text-charcoal">
      <div className="mx-auto max-w-4xl">
        <p className="font-body text-sm uppercase tracking-widest text-gold">N&apos;sK Zero Waste</p>
        <h1 className="mt-2 font-display text-3xl">Riduci gli sprechi</h1>
        <p className="mt-2 max-w-2xl font-body text-sm text-smoke">
          Registra ciò che butti via e lascia che l&apos;AI ti suggerisca come riutilizzarlo,
          conservarlo meglio o acquistarne meno la prossima volta.
        </p>

        <div className="mt-10">
          <WasteTracker />
        </div>
      </div>
    </div>
  );
}
