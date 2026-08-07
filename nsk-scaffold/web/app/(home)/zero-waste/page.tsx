import { WasteTracker } from "@/components/waste/WasteTracker";
import { SectionBanner } from "@/components/layout/SectionBanner";

// Protetta da middleware.ts (/zero-waste richiede utente autenticato,
// qualunque ruolo — feature "zero_waste" del piano home_premium, vedi
// supabase/schema.sql). I dati veri restano comunque dietro RLS
// "waste_items_owner": questa è solo la UX di redirect per anonimi.
export default function ZeroWastePage() {
  return (
    <div className="mx-auto max-w-content px-6 py-14 text-ivory">
      <SectionBanner image="/images/marketing/zero-waste.webp" />
      <p className="font-body text-sm uppercase tracking-widest text-teal">N&apos;sK Home</p>
      <h1 className="mt-2 font-display text-display-md text-ivory">Zero Waste</h1>
      <p className="mt-2 max-w-xl font-body text-ivory/70">
        Registra ciò che butti via e lascia che l&apos;AI ti suggerisca come riutilizzarlo,
        conservarlo meglio o acquistarne meno la prossima volta.
      </p>

      <div className="mt-10">
        <WasteTracker />
      </div>
    </div>
  );
}
