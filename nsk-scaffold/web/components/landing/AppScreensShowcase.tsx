import { PhoneScreen } from "./PhoneScreen";

const SCREENS = [
  { variant: "dispensa" as const, caption: "Dispensa & scadenze" },
  { variant: "ricette" as const, caption: "Ricette suggerite" },
  { variant: "report" as const, caption: "Report sprechi" },
  { variant: "lista" as const, caption: "Lista della spesa" },
];

export function AppScreensShowcase() {
  return (
    <div className="px-6 py-[clamp(48px,7vw,88px)]" style={{ background: "var(--nsk-l-bg-alt)" }}>
      <div className="mx-auto max-w-content">
        <div className="mx-auto mb-14 max-w-[600px] text-center">
          <h2 className="mb-3 font-display text-[clamp(1.6rem,3vw,2.2rem)] font-bold leading-[1.2]" style={{ color: "var(--nsk-l-text)" }}>
            Una piattaforma, due modalità d&apos;uso
          </h2>
          <p className="font-body text-[15px] leading-[1.6]" style={{ color: "var(--nsk-l-text-secondary)" }}>
            Stessa base dati, vista adattata a chi cucina in casa e a chi gestisce una cucina professionale.
          </p>
        </div>
        <div className="grid justify-center gap-8 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
          {SCREENS.map((s) => (
            <div key={s.variant} className="flex flex-col items-center gap-4">
              <PhoneScreen variant={s.variant} />
              <div className="font-body text-xs font-semibold tracking-[0.03em]" style={{ color: "var(--nsk-l-text-secondary)" }}>
                {s.caption}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
