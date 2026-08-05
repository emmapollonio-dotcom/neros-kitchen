import { createSupabaseServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ chefId: string }>;
}

// Server Component — profilo pubblico chef, SEO-friendly (SSR).
export default async function ChefProfilePage({ params }: Props) {
  const { chefId } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: chef } = await supabase
    .from("v_chef_public_profile")
    .select("*")
    .eq("id", chefId)
    .single();

  if (!chef) return notFound();

  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, rating, comment, created_at")
    .eq("chef_id", chefId)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="min-h-screen bg-ivory text-charcoal">
      <section className="mx-auto max-w-4xl px-6 py-16">
        <p className="font-body text-sm uppercase tracking-widest text-gold">
          {chef.specialties?.join(" · ")}
        </p>
        <h1 className="mt-2 font-display text-4xl text-charcoal">
          {chef.business_name ?? chef.full_name}
        </h1>
        <p className="mt-4 max-w-2xl font-body text-smoke leading-relaxed">
          {chef.bio}
        </p>

        <div className="mt-8 flex items-center gap-6 font-body text-sm text-smoke">
          <span>
            ★ {chef.rating_avg ?? "—"} ({chef.rating_count ?? 0} recensioni)
          </span>
          <span>Da {chef.hourly_rate ?? "—"} €/h</span>
          <span>Lingue: {chef.languages?.join(", ")}</span>
        </div>

        <a
          href={`/chefs/${chefId}/book`}
          className="mt-10 inline-block rounded-nsk bg-charcoal px-8 py-3 font-body text-ivory transition hover:bg-gold hover:text-charcoal"
        >
          Richiedi disponibilità
        </a>

        <div className="mt-16">
          <h2 className="font-display text-xl text-charcoal">Recensioni</h2>
          {(!reviews || reviews.length === 0) && (
            <p className="mt-3 font-body text-sm text-smoke">Ancora nessuna recensione.</p>
          )}
          <ul className="mt-4 space-y-4">
            {(reviews ?? []).map((r) => (
              <li key={r.id} className="rounded-nsk border border-smoke/15 bg-white p-4">
                <p className="font-body text-sm text-gold">{"★".repeat(r.rating)}</p>
                {r.comment && (
                  <p className="mt-1 font-body text-sm text-charcoal">{r.comment}</p>
                )}
                <p className="mt-1 font-body text-xs text-smoke">
                  {new Date(r.created_at).toLocaleDateString("it-IT")}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
