import Link from "next/link";

const COLUMNS: Array<{ title: string; links: Array<{ label: string; href: string }> }> = [
  {
    title: "Prodotto",
    links: [
      { label: "Marketplace chef", href: "/chefs" },
      { label: "N'sK Home", href: "/ricette" },
      { label: "N'sK Pro", href: "/food-cost" },
      { label: "Prezzi", href: "/pricing" },
    ],
  },
  {
    title: "Legale",
    links: [
      { label: "Termini di servizio", href: "/termini" },
      { label: "Informativa privacy", href: "/privacy" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-cream">
      <div className="mx-auto max-w-content px-6 py-16">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-2">
            <span className="font-display text-lg text-charcoal">Nero&apos;s Kitchen</span>
            <p className="mt-3 max-w-xs font-body text-sm text-smoke">
              L&apos;ecosistema per chi vive di cucina — a casa, in cucina professionale, in
              consulenza.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="font-body text-xs uppercase tracking-widest text-mist">{col.title}</p>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="font-body text-sm text-smoke hover:text-charcoal">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-14 font-body text-xs text-mist">
          © {new Date().getFullYear()} Nero&apos;s Kitchen. Tutti i diritti riservati.
        </p>
      </div>
    </footer>
  );
}
