import { getTranslations } from "next-intl/server";
import { HaccpTracker } from "@/components/haccp/HaccpTracker";
import { SectionBanner } from "@/components/layout/SectionBanner";

// Protetta da middleware.ts (/haccp richiede ruolo chef/admin — feature
// "haccp" del piano pro_growth, vedi supabase/schema.sql).
export default async function HaccpPage() {
  const t = await getTranslations("haccp");
  return (
    <div className="mx-auto max-w-content px-6 py-14 text-shell-fg">
      <SectionBanner image="/images/marketing/haccp.webp" />
      <p className="font-body text-sm uppercase tracking-widest text-teal">N&apos;sK Pro</p>
      <h1 className="mt-2 font-display text-display-md text-shell-fg">HACCP</h1>
      <p className="mt-2 max-w-xl font-body text-shell-fg-secondary">{t("subtitle")}</p>

      <div className="mt-10">
        <HaccpTracker />
      </div>
    </div>
  );
}
