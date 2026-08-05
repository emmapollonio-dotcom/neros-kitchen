"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

// Cattura gli errori di rendering React non gestiti da nessun altro
// error.tsx più specifico, e li manda a Sentry (no-op se SENTRY_DSN non è
// configurato — vedi instrumentation-client.ts). Sostituisce temporaneamente
// l'intero root layout, quindi include di nuovo html/body come richiesto da
// Next.js per i global-error.
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="it">
      <body>
        <div style={{ padding: "3rem", textAlign: "center", fontFamily: "sans-serif" }}>
          <h1>Qualcosa è andato storto</h1>
          <p>Il problema è stato registrato. Riprova tra poco.</p>
        </div>
      </body>
    </html>
  );
}
