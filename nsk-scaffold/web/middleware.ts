import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Route protette per ruolo minimo richiesto.
// Ordine dal più specifico al meno specifico: il primo prefisso che matcha vince.
//
// NOTA (fix Sprint 6): le entry "/pro" e "/home/tutor-ai" qui sotto non hanno
// MAI fatto match, perché (pro) e (home) sono route group Next.js — le
// parentesi non compaiono nell'URL reale (es. app/(pro)/crm/page.tsx serve
// /crm, non /pro/crm). Risultato: food-cost, crm, analytics, academy-pro e
// tutor-ai erano raggiungibili da anonimi senza redirect a /login (i dati
// restavano comunque protetti dalle RLS e dal controllo auth nelle route
// API, ma la UI mostrava la shell della pagina invece di rimandare al
// login). Corretto elencando i path reali.
const ROLE_GUARDS: Array<{ prefix: string; roles: Array<"customer" | "chef" | "admin"> }> = [
  { prefix: "/admin", roles: ["admin"] },
  // N'sK Pro
  { prefix: "/food-cost", roles: ["chef", "admin"] },
  { prefix: "/crm", roles: ["chef", "admin"] },
  { prefix: "/analytics", roles: ["chef", "admin"] },
  { prefix: "/academy-pro", roles: ["chef", "admin"] },
  // N'sK Home
  { prefix: "/tutor-ai", roles: ["customer", "chef", "admin"] },
  { prefix: "/zero-waste", roles: ["customer", "chef", "admin"] },
  { prefix: "/bookings", roles: ["customer", "chef", "admin"] },
];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const guard = ROLE_GUARDS.find((g) => path.startsWith(g.prefix));

  if (guard) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", path);
      return NextResponse.redirect(loginUrl);
    }

    // Il ruolo reale vive in profiles.role, sincronizzato nel JWT come custom claim
    // dall'Auth Hook (vedi Step 10 del documento di architettura). Fallback a query
    // diretta se il claim non è ancora presente (prima configurazione dell'hook).
    const role = (user.app_metadata?.role as string | undefined) ?? "customer";

    if (!guard.roles.includes(role as never)) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Applica il middleware a tutte le route tranne asset statici e API interne
     * (le API hanno il proprio controllo auth+RLS, vedi route handler).
     */
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
