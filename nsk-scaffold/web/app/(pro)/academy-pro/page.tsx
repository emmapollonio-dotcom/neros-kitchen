import { CourseManager } from "@/components/academy/CourseManager";

// Protetta da middleware.ts (/pro richiede ruolo chef/admin).
export default function AcademyProPage() {
  return (
    <div className="min-h-screen bg-ivory px-6 py-16 text-charcoal">
      <div className="mx-auto max-w-3xl">
        <p className="font-body text-sm uppercase tracking-widest text-gold">N&apos;sK Pro</p>
        <h1 className="mt-2 font-display text-3xl">Academy</h1>
        <p className="mt-2 font-body text-smoke">
          Crea corsi, aggiungi lezioni video e quiz di verifica per i tuoi allievi.
        </p>

        <div className="mt-10">
          <CourseManager />
        </div>
      </div>
    </div>
  );
}
