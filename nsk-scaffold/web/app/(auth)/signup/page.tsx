"use client";

import { useActionState } from "react";
import { signUpAction, type AuthActionState } from "../actions";
import Link from "next/link";

const initialState: AuthActionState = { error: null };

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signUpAction, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl text-charcoal">Crea il tuo account</h1>
        <p className="mt-2 font-body text-sm text-smoke">
          Gratis per iniziare. Passa a N&apos;sK Pro quando vuoi.
        </p>

        <form action={formAction} className="mt-8 space-y-4">
          <div>
            <label className="font-body text-sm text-smoke" htmlFor="fullName">
              Nome completo
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              minLength={2}
              className="mt-1 w-full rounded-nsk border border-smoke/30 bg-white px-4 py-2 font-body text-charcoal focus:border-gold focus:outline-none"
            />
          </div>
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
              minLength={8}
              className="mt-1 w-full rounded-nsk border border-smoke/30 bg-white px-4 py-2 font-body text-charcoal focus:border-gold focus:outline-none"
            />
            <p className="mt-1 font-body text-xs text-smoke">Almeno 8 caratteri.</p>
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
            {pending ? "Creazione account..." : "Registrati"}
          </button>

          <p className="text-center font-body text-xs text-smoke">
            Registrandoti accetti i{" "}
            <Link href="/termini" className="underline hover:text-gold">
              Termini di servizio
            </Link>{" "}
            e l&apos;
            <Link href="/privacy" className="underline hover:text-gold">
              Informativa privacy
            </Link>
            .
          </p>
        </form>

        <p className="mt-6 text-center font-body text-sm text-smoke">
          Hai già un account?{" "}
          <Link href="/login" className="text-gold underline">
            Accedi
          </Link>
        </p>
      </div>
    </div>
  );
}
