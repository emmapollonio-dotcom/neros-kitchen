import { SocialStudio } from "@/components/social/SocialStudio";

// Protetta da middleware.ts (/social-studio richiede ruolo chef/admin —
// feature "social_studio" del piano pro_growth, vedi supabase/schema.sql).
export default function SocialStudioPage() {
  return (
    <div className="min-h-screen bg-ivory px-6 py-16 text-charcoal">
      <div className="mx-auto max-w-3xl">
        <p className="font-body text-sm uppercase tracking-widest text-gold">N&apos;sK Pro</p>
        <h1 className="mt-2 font-display text-3xl">Social Media Studio</h1>
        <p className="mt-2 font-body text-sm text-smoke">
          Genera didascalie e hashtag pronti per Instagram, Facebook, TikTok e LinkedIn a
          partire da un piatto o un argomento.
        </p>

        <div className="mt-10">
          <SocialStudio />
        </div>
      </div>
    </div>
  );
}
