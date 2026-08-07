"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  courseId: string;
  courseSlug: string;
  isEnrolled: boolean;
  isAuthenticated: boolean;
}

// Iscrizione a un corso. Se l'utente non è autenticato lo manda al login con
// redirect di ritorno (stesso pattern del middleware). Se già iscritto, porta
// direttamente alla pagina di apprendimento.
export function EnrollButton({ courseId, courseSlug, isEnrolled, isAuthenticated }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isEnrolled) {
    return (
      <a
        href={`/academy/${courseSlug}/learn`}
        className="inline-block rounded-nsk bg-charcoal px-8 py-3 font-body text-ivory transition hover:bg-teal hover:text-white"
      >
        Continua il corso
      </a>
    );
  }

  async function handleEnroll() {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/academy/${courseSlug}`);
      return;
    }

    setSubmitting(true);
    setError(null);

    const res = await fetch(`/api/v1/courses/${courseId}/enroll`, { method: "POST" });

    setSubmitting(false);

    if (!res.ok) {
      setError("Impossibile completare l'iscrizione.");
      return;
    }

    router.push(`/academy/${courseSlug}/learn`);
    router.refresh();
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleEnroll}
        disabled={submitting}
        className="rounded-nsk bg-charcoal px-8 py-3 font-body text-ivory transition hover:bg-teal hover:text-white disabled:opacity-50"
      >
        {submitting ? "Iscrizione..." : "Iscriviti al corso"}
      </button>
      {error && <p className="mt-2 font-body text-sm text-red-600">{error}</p>}
    </div>
  );
}
