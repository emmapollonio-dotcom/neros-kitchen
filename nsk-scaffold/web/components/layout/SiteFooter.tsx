import Link from "next/link";
import { getTranslations } from "next-intl/server";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const tn = await getTranslations("nav");

  const columns: Array<{ title: string; links: Array<{ label: string; href: string }> }> = [
    {
      title: t("productTitle"),
      links: [
        { label: t("marketplaceChef"), href: "/chefs" },
        { label: tn("nskHome"), href: "/ricette" },
        { label: tn("nskPro"), href: "/food-cost" },
        { label: tn("pricing"), href: "/pricing" },
      ],
    },
    {
      title: t("legalTitle"),
      links: [
        { label: t("terms"), href: "/termini" },
        { label: t("privacyPolicy"), href: "/privacy" },
      ],
    },
  ];

  return (
    <footer className="border-t border-shell-border bg-shell">
      <div className="mx-auto max-w-content px-6 py-16">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-2">
            <span className="font-display text-lg text-shell-fg">Nero&apos;s Kitchen</span>
            <p className="mt-3 max-w-xs font-body text-sm text-shell-fg-secondary">{t("tagline")}</p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="font-body text-xs uppercase tracking-widest text-shell-fg-muted">{col.title}</p>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="font-body text-sm text-shell-fg-secondary hover:text-shell-fg">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-14 font-body text-xs text-shell-fg-muted">
          © {new Date().getFullYear()} Nero&apos;s Kitchen. {t("copyright")}
        </p>
      </div>
    </footer>
  );
}
