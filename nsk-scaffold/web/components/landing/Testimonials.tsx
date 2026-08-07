import { Star } from "lucide-react";
import { Reveal } from "./Reveal";

const TESTIMONIALS = [
  {
    name: "Marco Ferrari",
    role: "Chef, ristorante La Brace",
    quote:
      "Abbiamo ridotto lo scarto di cucina in modo misurabile già nel primo mese. I report ci hanno aiutato a rivedere gli ordini.",
  },
  {
    name: "Giulia Conti",
    role: "Home cook",
    quote: "Non butto quasi più niente. L'app mi propone ricette proprio con quello che sta per scadere.",
  },
  {
    name: "Andrea Colombo",
    role: "Sous-chef, hotel Aurora",
    quote: "Semplice da integrare nel flusso di lavoro quotidiano, senza complicare la gestione della dispensa.",
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export function Testimonials() {
  return (
    <div className="mx-auto max-w-content px-6 py-[clamp(48px,7vw,88px)]">
      <div className="mb-12 text-center">
        <div className="font-body text-xs font-semibold uppercase tracking-[0.06em] text-teal-dark">Chi lo usa</div>
      </div>
      <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]">
        {TESTIMONIALS.map((item, i) => (
          <Reveal key={item.name} index={i}>
            <div
              className="h-full rounded-card border p-7 shadow-[var(--nsk-l-shadow)] transition-shadow duration-[250ms] ease-nsk hover:shadow-[var(--nsk-l-shadow-hover)]"
              style={{ background: "var(--nsk-l-card-bg)", borderColor: "var(--nsk-l-border)" }}
            >
              <div className="mb-4 flex gap-[3px]">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} size={12} className="fill-teal text-teal" />
                ))}
              </div>
              <p className="mb-5 font-body text-[15px] leading-[1.6]" style={{ color: "var(--nsk-l-text)" }}>
                {item.quote}
              </p>
              <div className="flex items-center gap-2.5">
                <div className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-pill bg-teal font-body text-xs font-bold text-white">
                  {initials(item.name)}
                </div>
                <div>
                  <div className="font-body text-[13px] font-bold" style={{ color: "var(--nsk-l-text)" }}>
                    {item.name}
                  </div>
                  <div className="font-body text-xs font-medium" style={{ color: "var(--nsk-l-text-muted)" }}>
                    {item.role}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
