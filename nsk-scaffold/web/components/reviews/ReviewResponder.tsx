"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  chef_response: string | null;
  chef_response_at: string | null;
  created_at: string;
}

// Elenco recensioni ricevute + bottone "Rispondi con AI" per quelle senza
// risposta. Ogni scrittura passa da /api/v1/reviews/{id}/respond, che si
// appoggia a RLS ("reviews_chef_respond") come unica fonte di verità sui
// permessi.
export function ReviewResponder() {
  const t = useTranslations("reviews");
  const locale = useLocale();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadReviews() {
    setLoading(true);
    const res = await fetch("/api/v1/reviews");
    if (res.ok) {
      const body = await res.json();
      setReviews(body.data ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadReviews();
  }, []);

  async function handleRespond(id: string) {
    setRespondingId(id);
    setError(null);

    const res = await fetch(`/api/v1/reviews/${id}/respond`, { method: "POST" });
    const body = await res.json().catch(() => null);

    if (!res.ok) {
      setError(body?.error ?? t("errorRespond"));
    } else {
      setReviews((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, chef_response: body.data.chef_response, chef_response_at: body.data.chef_response_at }
            : r
        )
      );
    }
    setRespondingId(null);
  }

  if (loading) return <p className="font-body text-sm text-smoke">{t("loading")}</p>;
  if (reviews.length === 0)
    return <p className="font-body text-sm text-smoke">{t("noReviews")}</p>;

  return (
    <div className="space-y-4">
      {error && <p className="font-body text-sm text-red-600">{error}</p>}
      {reviews.map((review) => (
        <div key={review.id} className="rounded-nsk border border-smoke/15 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="font-body text-sm text-teal">{"★".repeat(review.rating)}</p>
            <p className="font-body text-xs text-smoke">
              {new Date(review.created_at).toLocaleDateString(locale)}
            </p>
          </div>

          {review.comment && (
            <p className="mt-2 font-body text-sm text-charcoal">{review.comment}</p>
          )}

          {review.chef_response ? (
            <div className="mt-4 rounded-nsk bg-ivory p-3">
              <p className="font-body text-xs uppercase tracking-wide text-teal">{t("yourResponse")}</p>
              <p className="mt-1 font-body text-sm text-charcoal">{review.chef_response}</p>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleRespond(review.id)}
              disabled={respondingId === review.id}
              className="mt-4 rounded-nsk bg-teal px-4 py-2 font-body text-xs text-white hover:bg-teal-dark disabled:opacity-50"
            >
              {respondingId === review.id ? t("generating") : t("respondWithAi")}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
