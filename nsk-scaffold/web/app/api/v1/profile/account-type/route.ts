import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const accountTypeSchema = z.object({
  accountType: z.enum(["customer", "chef"]),
});

// POST /api/v1/profile/account-type — passa da "cucino per me" a
// "professionista" (o viceversa) dopo la registrazione. Scrive tramite la
// funzione public.set_own_account_type(), non con un update diretto: la
// colonna profiles.role non è più aggiornabile via REST per l'utente
// autenticato (revocato apposta), altrimenti chiunque potrebbe provare ad
// auto-assegnarsi un role diverso passando un valore arbitrario. La
// funzione accetta solo 'customer'/'chef' — mai 'admin'.
export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: null, error: "unauthorized", meta: null }, { status: 401 });
  }

  const parsed = accountTypeSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: parsed.error.flatten(), meta: null },
      { status: 400 }
    );
  }

  const { error } = await supabase.rpc("set_own_account_type", {
    new_type: parsed.data.accountType,
  });

  if (error) {
    return NextResponse.json({ data: null, error: error.message, meta: null }, { status: 500 });
  }

  return NextResponse.json({ data: { accountType: parsed.data.accountType }, error: null, meta: null });
}
