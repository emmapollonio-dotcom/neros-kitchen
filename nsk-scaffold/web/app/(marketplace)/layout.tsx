import { AppNav } from "@/components/layout/AppNav";
import { SiteFooter } from "@/components/layout/SiteFooter";

// Il marketplace è raggiungibile anche da anonimi (profilo chef pubblico è
// SEO-friendly), ma AppNav si adatta da sola: mostra login/signup nel menu
// utente se non c'è sessione, i 4 pilastri se c'è.
export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-charcoal text-ivory">
      <AppNav />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
