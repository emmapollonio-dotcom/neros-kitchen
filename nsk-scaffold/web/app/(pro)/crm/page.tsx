import { LeadBoard } from "@/components/crm/LeadBoard";

// Protetta da middleware.ts (/pro richiede ruolo chef/admin).
export default function CrmPage() {
  return (
    <div className="min-h-screen bg-ivory px-6 py-16 text-charcoal">
      <div className="mx-auto max-w-6xl">
        <p className="font-body text-sm uppercase tracking-widest text-gold">N&apos;sK Pro</p>
        <h1 className="mt-2 font-display text-3xl">CRM</h1>
        <p className="mt-2 font-body text-smoke">
          Pipeline lead, follow-up e timeline attività in un unico posto.
        </p>

        <div className="mt-10">
          <LeadBoard />
        </div>
      </div>
    </div>
  );
}
