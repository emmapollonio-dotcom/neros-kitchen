"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

// Lo spec ("no destination — wire to signup/demo flows during
// implementation") lascia il campo email senza endpoint. Qui lo colleghiamo
// al flusso di signup esistente (email precompilata via query param) invece
// di lasciare un bottone morto.
export function FinalCTA() {
  const t = useTranslations("landing");
  const router = useRouter();
  const [email, setEmail] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = email ? `?email=${encodeURIComponent(email)}` : "";
    router.push(`/signup${params}`);
  }

  return (
    <div
      className="px-6 py-[clamp(56px,8vw,100px)]"
      style={{ background: "linear-gradient(160deg,#1a1a18 0%,#111110 65%,#000000 100%)" }}
    >
      <div className="mx-auto max-w-[620px] text-center">
        <h2 className="mb-4 font-display text-[clamp(1.9rem,4vw,2.8rem)] font-bold leading-[1.15] text-ivory">
          {t("finalTitle")}
        </h2>
        <p className="mb-9 font-body text-base leading-[1.6] text-ivory/70">{t("finalSub")}</p>
        <form onSubmit={handleSubmit} className="flex flex-wrap justify-center gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("emailPlaceholder")}
            className="min-w-[240px] rounded-nsk border border-ivory/10 bg-[#1c1c19] px-[18px] py-[13px] font-body text-sm font-medium text-ivory placeholder:text-ivory/50 focus:border-[var(--nsk-l-accent)] focus:outline focus:outline-2 focus:outline-[var(--nsk-l-accent)]"
          />
          <button
            type="submit"
            className="rounded-nsk bg-[var(--nsk-l-accent)] px-6 py-[13px] font-body text-sm font-semibold text-[#121212] transition-colors duration-[250ms] ease-nsk hover:bg-[var(--nsk-l-accent-dark)]"
          >
            {t("finalButton")}
          </button>
        </form>
      </div>
    </div>
  );
}
