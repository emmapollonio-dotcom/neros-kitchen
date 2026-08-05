import { HaccpTracker } from "@/components/haccp/HaccpTracker";

// Protetta da middleware.ts (/haccp richiede ruolo chef/admin — feature
// "haccp" del piano pro_growth, vedi supabase/schema.sql).
export default function HaccpPage() {
  return (
    <div className="mx-auto max-w-content px-6 py-14 text-charcoal">
      <p className="font-body text-sm uppercase tracking-widest text-gold">N&apos;sK Pro</p>
      <h1 className="mt-2 font-display text-display-md text-charcoal">HACCP</h1>
      <p className="mt-2 max-w-xl font-body text-smoke">
        Registra i punti di controllo (frigo, freezer, celle) e le rilevazioni di temperatura.
        Sulle non conformità puoi generare un&apos;azione correttiva con l&apos;AI.
      </p>

      <div className="mt-10">
        <HaccpTracker />
      </div>
    </div>
  );
}
