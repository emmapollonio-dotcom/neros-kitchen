import { CourseManager } from "@/components/academy/CourseManager";

// Protetta da middleware.ts (/pro richiede ruolo chef/admin).
export default function AcademyProPage() {
  return (
    <div className="mx-auto max-w-content px-6 py-14 text-ivory">
      <p className="font-body text-sm uppercase tracking-widest text-gold">N&apos;sK Pro</p>
      <h1 className="mt-2 font-display text-display-md text-ivory">Academy Pro</h1>
      <p className="mt-2 max-w-xl font-body text-ivory/70">
        Crea corsi, aggiungi lezioni video e quiz di verifica per i tuoi allievi — e vendili ad
        altri chef sulla piattaforma.
      </p>

      <div className="mt-10">
        <CourseManager />
      </div>
    </div>
  );
}
