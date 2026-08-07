import { LeadBoard } from "@/components/crm/LeadBoard";
import { ReviewResponder } from "@/components/reviews/ReviewResponder";
import { TabSwitcher } from "@/components/layout/TabSwitcher";
import { SectionBanner } from "@/components/layout/SectionBanner";

// Protetta da middleware.ts (/crm richiede ruolo chef/admin).
// "Recensioni" è confluita qui come tab: sono entrambe relazione con il
// cliente (acquisizione + reputazione), non due strumenti separati.
export default function CrmPage() {
  return (
    <div className="mx-auto max-w-content px-6 py-14 text-ivory">
      <SectionBanner image="/images/marketing/dining-event.webp" />
      <p className="font-body text-sm uppercase tracking-widest text-teal">N&apos;sK Pro</p>
      <h1 className="mt-2 font-display text-display-md text-ivory">CRM</h1>
      <p className="mt-2 max-w-xl font-body text-ivory/70">
        Pipeline lead, follow-up e reputazione — tutta la relazione con il cliente in un posto.
      </p>

      <div className="mt-10">
        <TabSwitcher
          tabs={[
            { id: "pipeline", label: "Pipeline lead", content: <LeadBoard /> },
            { id: "recensioni", label: "Recensioni", content: <ReviewResponder /> },
          ]}
        />
      </div>
    </div>
  );
}
