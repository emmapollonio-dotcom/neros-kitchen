"use client";

import { Suspense, useActionState, useState } from "react";
import { signUpAction, type AuthActionState } from "../actions";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChefHat, UtensilsCrossed } from "lucide-react";

const initialState: AuthActionState = { error: null };

// useSearchParams() forza il bailout a client-side rendering durante il
// prerendering statico: isolato in un componente figlio avvolto da
// <Suspense>, stesso pattern di /login (altrimenti la build fallisce).
export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const [state, formAction, pending] = useActionState(signUpAction, initialState);
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") === "professionista" ? "chef" : "customer";
  const [accountType, setAccountType] = useState<"customer" | "chef">(initialType);

  return (
    <div className="flex min-h-[calc(100vh-88px)] items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm rounded-panel border border-line bg-white p-8 shadow-elevated">
        <h1 className="font-display text-3xl text-charcoal">Crea il tuo account</h1>
        <p className="mt-2 font-body text-sm text-smoke">
          Gratis per iniziare. Passa a N&apos;sK Pro quando vuoi.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <AccountTypeCard
            icon={UtensilsCrossed}
            label="Cucino per me"
            desc="Ricette, meal planner, zero waste"
            selected={accountType === "customer"}
            onClick={() => setAccountType("customer")}
          />
          <AccountTypeCard
            icon={ChefHat}
            label="Sono un professionista"
            desc="Food cost, HACCP, CRM, prenotazioni"
            selected={accountType === "chef"}
            onClick={() => setAccountType("chef")}
          />
        </div>
        <p className="mt-2 font-body text-xs text-mist">
          Puoi cambiarlo in qualsiasi momento dal tuo profilo.
        </p>

        <form action={formAction} className="mt-6 space-y-4">
          <input type="hidden" name="accountType" value={accountType} />

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
              className="mt-1 w-full rounded-nsk border border-smoke/30 bg-white px-4 py-2 font-body text-charcoal focus:border-teal focus:outline-none"
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
              className="mt-1 w-full rounded-nsk border border-smoke/30 bg-white px-4 py-2 font-body text-charcoal focus:border-teal focus:outline-none"
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
              className="mt-1 w-full rounded-nsk border border-smoke/30 bg-white px-4 py-2 font-body text-charcoal focus:border-teal focus:outline-none"
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
            className="w-full rounded-nsk bg-charcoal px-4 py-3 font-body text-ivory transition hover:bg-teal hover:text-white disabled:opacity-50"
          >
            {pending ? "Creazione account..." : "Registrati"}
          </button>

          <p className="text-center font-body text-xs text-smoke">
            Registrandoti accetti i{" "}
            <Link href="/termini" className="underline hover:text-teal">
              Termini di servizio
            </Link>{" "}
            e l&apos;
            <Link href="/privacy" className="underline hover:text-teal">
              Informativa privacy
            </Link>
            .
          </p>
        </form>

        <p className="mt-6 text-center font-body text-sm text-smoke">
          Hai già un account?{" "}
          <Link href="/login" className="text-teal underline">
            Accedi
          </Link>
        </p>
      </div>
    </div>
  );
}

function AccountTypeCard({
  icon: Icon,
  label,
  desc,
  selected,
  onClick,
}: {
  icon: typeof ChefHat;
  label: string;
  desc: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-card border p-4 text-left transition ${
        selected ? "border-teal bg-teal/10" : "border-line bg-white hover:border-smoke/40"
      }`}
    >
      <Icon size={18} className={selected ? "text-teal-dark" : "text-smoke"} />
      <p className="mt-2 font-body text-sm font-medium text-charcoal">{label}</p>
      <p className="mt-0.5 font-body text-xs text-mist">{desc}</p>
    </button>
  );
}
