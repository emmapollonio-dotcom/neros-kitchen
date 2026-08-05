import { createSupabaseServerClient } from "@/lib/supabase/server";
import { computeFreeSlots } from "@/lib/availability/compute-free-slots";
import { BookingForm } from "@/components/booking/BookingForm";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ chefId: string }>;
}

// Server Component — richiede utente autenticato (middleware.ts protegge /bookings,
// questa route resta pubblica in lettura ma la POST del form richiede sessione:
// vedi RLS "bookings_customer_insert" in schema.sql).
export default async function BookChefPage({ params }: Props) {
  const { chefId } = await params;
  const supabase = await createSupabaseServerClient();

  const [{ data: chef }, { data: availability }] = await Promise.all([
    supabase.from("v_chef_public_profile").select("business_name, full_name").eq("id", chefId).single(),
    supabase
      .from("chef_availability")
      .select("id, start_at, end_at, is_booked")
      .eq("chef_id", chefId)
      .order("start_at", { ascending: true }),
  ]);

  if (!chef) return notFound();

  const days = computeFreeSlots(availability ?? []);

  return (
    <div className="min-h-screen bg-ivory px-6 py-16 text-charcoal">
      <div className="mx-auto max-w-2xl">
        <p className="font-body text-sm uppercase tracking-widest text-gold">Prenota</p>
        <h1 className="mt-2 font-display text-3xl">{chef.business_name ?? chef.full_name}</h1>

        <div className="mt-10">
          <BookingForm chefId={chefId} days={days} />
        </div>
      </div>
    </div>
  );
}
