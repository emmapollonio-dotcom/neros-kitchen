import type { Metadata } from "next";
import { NeroTapasBarPage } from "@/components/nero-tapas-bar/NeroTapasBarPage";

// Route fuori da app/(marketing) di proposito: questa pagina replica il sito
// reale del ristorante di Emmanuele (neroskitchen.co.uk) con la propria
// identità nero+oro, nav e footer dedicati — non deve ereditare
// SiteHeader/SiteFooter né i token shell/card del resto dell'app N'sK.
// Stesso pattern isolato della landing principale ("/").
export const metadata: Metadata = {
  title: "Nero's Tapas Bar | Mediterranean Tapas & Grill in Denton",
  description:
    "Nero's Tapas Bar - Mediterranean Tapas Experience a Denton, Manchester. Mezze, tapas, burger gourmet e carni alla griglia.",
};

export default function Page() {
  return <NeroTapasBarPage />;
}
