import { getTranslations } from "next-intl/server";
import { CourseManager } from "@/components/academy/CourseManager";
import { SectionBanner } from "@/components/layout/SectionBanner";

// Protetta da middleware.ts (/pro richiede ruolo chef/admin).
export default async function AcademyProPage() {
  const t = await getTranslations("academyPro");
  return (
    <div className="mx-auto max-w-content px-6 py-14 text-shell-fg">
      <SectionBanner image="/images/marketing/chef-plating.webp" />
      <p className="font-body text-sm uppercase tracking-widest text-teal">N&apos;sK Pro</p>
      <h1 className="mt-2 font-display text-display-md text-shell-fg">Academy Pro</h1>
      <p className="mt-2 max-w-xl font-body text-shell-fg-secondary">{t("subtitle")}</p>

      <div className="mt-10">
        <CourseManager />
      </div>
    </div>
  );
}
