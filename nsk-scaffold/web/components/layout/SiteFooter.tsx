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
    <footer className="border-t border-haze bg-ink">
      <div className="mx-auto max-w-content px-6 py-16">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-2">
            <span className="font-display text-lg text-ivory">Nero&apos;s Kitchen</span>
            <p className="mt-3 max-w-xs font-body text-sm text-ivory/60">{t("tagline")}</p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="font-body text-xs uppercase tracking-widest text-ivory/40">{col.title}</p>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="font-body text-sm text-ivory/60 hover:text-ivory">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-14 font-body text-xs text-ivory/40">
          © {new Date().getFullYear()} Nero&apos;s Kitchen. {t("copyright")}
        </p>
      </div>
    </footer>
  );
}
