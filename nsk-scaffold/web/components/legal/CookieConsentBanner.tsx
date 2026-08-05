"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "nsk_cookie_consent";

type ConsentValue = "all" | "essential";

// Oggi il sito usa solo cookie tecnici essenziali (sessione di accesso):
// "Accetta tutti" e "Solo essenziali" hanno quindi lo stesso effetto pratico
// in questo momento. La scelta viene comunque salvata e va rispettata da
// qualunque script di analytics/marketing che verrà eventualmente aggiunto
// in futuro (leggere STORAGE_KEY da localStorage prima di caricarlo).
export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) setVisible(true);
  }, []);

  function choose(value: ConsentValue) {
    window.localStorage.setItem(STORAGE_KEY, value);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-smoke/20 bg-charcoal px-6 py-4 text-ivory">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="font-body text-sm">
          Usiamo cookie tecnici essenziali per far funzionare l&apos;accesso al sito. Vedi la{" "}
          <a href="/privacy" className="underline hover:text-gold">
            informativa privacy
          </a>
          .
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            onClick={() => choose("essential")}
            className="rounded-nsk border border-ivory/40 px-4 py-2 font-body text-sm hover:border-gold hover:text-gold"
          >
            Solo essenziali
          </button>
          <button
            onClick={() => choose("all")}
            className="rounded-nsk bg-gold px-4 py-2 font-body text-sm text-charcoal hover:bg-ivory"
          >
            Accetta tutti
          </button>
        </div>
      </div>
    </div>
  );
}
