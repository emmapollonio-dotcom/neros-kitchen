"use client";

import { Suspense, useActionState } from "react";
import { loginAction, signInWithGoogleAction, type AuthActionState } from "../actions";
import { useSearchParams } from "next/navigation";

const initialState: AuthActionState = { error: null };

// useSearchParams() forza il bailout a client-side rendering durante il
// prerendering statico: Next.js richiede che sia isolato in un componente
// figlio avvolto da <Suspense>, altrimenti la build fallisce su questa pagina.
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/";
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl text-charcoal">Accedi a N&apos;sK</h1>
        <p className="mt-2 font-body text-sm text-smoke">
          Ricette, prenotazioni chef e strumenti di business in un unico posto.
        </p>

        <form action={formAction} className="mt-8 space-y-4">
          <input type="hidden" name="redirect" value={redirectTo} />
          <div>
            <label className="font-body text-sm text-smoke" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded-nsk border border-smoke/30 bg-white px-4 py-2 font-body text-charcoal focus:border-gold focus:outline-none"
            />
          </div>
          <div>
            <label className="font-body text-sm text-smoke" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 w-full rounded-nsk border border-smoke/30 bg-white px-4 py-2 font-body text-charcoal focus:border-gold focus:outline-none"
            />
          </div>

          {state.error && (
            <p className="font-body text-sm text-red-600" role="alert">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-nsk bg-charcoal px-4 py-3 font-body text-ivory transition hover:bg-gold hover:text-charcoal disabled:opacity-50"
          >
            {pending ? "Accesso in corso..." : "Accedi"}
          </button>
        </form>

        <div className="mt-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-smoke/20" />
          <span className="font-body text-xs text-smoke">oppure</span>
          <div className="h-px flex-1 bg-smoke/20" />
        </div>

        <form action={signInWithGoogleAction} className="mt-4">
          <button
            type="submit"
            className="w-full rounded-nsk border border-smoke/30 px-4 py-3 font-body text-charcoal transition hover:border-gold"
          >
            Continua con Google
          </button>
        </form>

        <p className="mt-6 text-center font-body text-sm text-smoke">
          Non hai un account?{" "}
          <a href="/signup" className="text-gold underline">
            Registrati
          </a>
        </p>
      </div>
    </div>
  );
}
