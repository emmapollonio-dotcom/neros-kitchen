// Inizializza Sentry lato browser. `enabled: false` se NEXT_PUBLIC_SENTRY_DSN
// non è impostato, cosicché il file non fa nulla finché l'account Sentry non
// è stato creato — vedi SENTRY-SETUP.md.
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  tracesSampleRate: 0.1,
});

// Richiesto da @sentry/nextjs per tracciare le navigazioni App Router.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
