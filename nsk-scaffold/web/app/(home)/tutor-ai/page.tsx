import { getTranslations } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { TabSwitcher } from "@/components/layout/TabSwitcher";
import { ChefAssistantForm } from "@/components/tutor-ai/ChefAssistantForm";
import { CourseCatalog } from "@/components/tutor-ai/CourseCatalog";
import { SectionBanner } from "@/components/layout/SectionBanner";

// Server Component — hub di apprendimento unico stile MasterClass: guida AI
// personalizzata (Chef Assistant) + corsi strutturati con chef ospiti
// ("Corsi", ex /academy: la voce di menu separata è confluita qui, vedi
// lib/nav/pillars.ts). /academy resta come redirect per i link esistenti.
export default async function TutorAiPage() {
  const t = await getTranslations("tutorAi");
  const supabase = await createSupabaseServerClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("id, title, slug, description, level, price")
    .eq("published", true)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-content px-6 py-14 text-shell-fg">
      <SectionBanner image="/images/marketing/chef-plating.webp" />
      <p className="font-body text-sm uppercase tracking-widest text-teal">N&apos;sK Home</p>
      <h1 className="mt-2 font-display text-display-md text-shell-fg">Tutor AI</h1>
      <p className="mt-2 max-w-xl font-body text-shell-fg-secondary">{t("subtitle")}</p>

      <div className="mt-10">
        <TabSwitcher
          tabs={[
            {
              id: "assistant",
              label: t("assistantTab"),
              content: <ChefAssistantForm />,
            },
            {
              id: "corsi",
              label: t("coursesTab"),
              content: <CourseCatalog courses={courses ?? []} />,
            },
          ]}
        />
      </div>
    </div>
  );
}
