import Link from "next/link";

export interface ChefCardData {
  id: string;
  full_name: string;
  business_name: string | null;
  bio: string | null;
  specialties: string[] | null;
  languages: string[] | null;
  rating_avg: number | null;
  rating_count: number | null;
  verified: boolean;
  hourly_rate: number | null;
  event_min_price: number | null;
}

// Card in stile Airbnb: niente foto (non ne abbiamo di reali, meglio di
// no che placeholder finti), quindi il peso visivo va su iniziali/tipografia
// e su segnali di fiducia concreti (verificato, rating, lingue).
export function ChefCard({ chef }: { chef: ChefCardData }) {
  const displayName = chef.business_name ?? chef.full_name;
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const priceLabel =
    chef.event_min_price != null
      ? `Da €${chef.event_min_price} a evento`
      : chef.hourly_rate != null
        ? `Da €${chef.hourly_rate}/ora`
        : null;

  return (
    <Link
      href={`/chefs/${chef.id}`}
      className="group block rounded-card border border-line bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-elevated"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-pill bg-charcoal font-display text-lg text-ivory">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="truncate font-display text-lg text-charcoal">{displayName}</p>
          {chef.rating_count && chef.rating_count > 0 ? (
            <p className="font-body text-sm text-smoke">
              ★ {Number(chef.rating_avg).toFixed(1)} · {chef.rating_count} recensioni
            </p>
          ) : (
            <p className="font-body text-sm text-mist">Nuovo su N&apos;sK</p>
          )}
        </div>
        {chef.verified && (
          <span className="ml-auto shrink-0 rounded-pill bg-gold/15 px-3 py-1 font-body text-xs text-gold-dark">
            Verificato
          </span>
        )}
      </div>

      {chef.bio && (
        <p className="mt-4 line-clamp-2 font-body text-sm text-smoke">{chef.bio}</p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {(chef.specialties ?? []).slice(0, 3).map((s) => (
          <span key={s} className="rounded-pill bg-cream px-3 py-1 font-body text-xs text-smoke">
            {s}
          </span>
        ))}
      </div>

      {priceLabel && (
        <p className="mt-4 font-body text-sm font-medium text-charcoal">{priceLabel}</p>
      )}
    </Link>
  );
}
