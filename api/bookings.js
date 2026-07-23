// /api/bookings.js
// Gestisce le richieste di prenotazione: creazione (pubblica), lettura e
// aggiornamento stato (protette da password chef).
//
// Variabili d'ambiente richieste (da impostare su Vercel):
//   SUPABASE_URL, SUPABASE_SERVICE_KEY, ADMIN_PASSWORD,
//   RESEND_API_KEY, CHEF_EMAIL, FROM_EMAIL

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

function checkAdmin(req) {
  return req.headers["x-admin-password"] === process.env.ADMIN_PASSWORD;
}

async function sendEmail(to, subject, html) {
  if (!process.env.RESEND_API_KEY) return; // email disattivate se non configurate
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.FROM_EMAIL || "Nero's Kitchen <onboarding@resend.dev>",
        to,
        subject,
        html,
      }),
    });
  } catch (e) {
    console.error("Errore invio email:", e);
  }
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-password");
  if (req.method === "OPTIONS") return res.status(200).end();

  // ---------- GET: lista prenotazioni (solo chef) ----------
  if (req.method === "GET") {
    if (!checkAdmin(req)) return res.status(401).json({ error: "unauthorized" });
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("inviata", { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  // ---------- POST: nuova richiesta (pubblica) ----------
  if (req.method === "POST") {
    const b = req.body || {};
    if (!b.nome || !b.tel || !b.email || !b.ospiti || !b.indirizzo) {
      return res.status(400).json({ error: "missing_fields" });
    }
    const row = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      data: b.data || null,
      nome: b.nome, tel: b.tel, email: b.email,
      pacchetto: b.pacchetto || "", ospiti: b.ospiti, indirizzo: b.indirizzo,
      note: b.note || "", lingua: b.lingua || "it",
      stato: "richiesta", inviata: new Date().toISOString(),
    };
    const { error } = await supabase.from("bookings").insert(row);
    if (error) return res.status(500).json({ error: error.message });

    // Se la richiesta ha una data, la segna come occupata
    if (row.data) {
      await supabase.from("availability").upsert({ data: row.data, stato: "booked" });
    }

    // Email di notifica allo chef + conferma al cliente (best-effort, non blocca la risposta)
    sendEmail(
      process.env.CHEF_EMAIL,
      `Nuova richiesta — ${row.nome}`,
      `<p><b>${row.nome}</b> ha inviato una richiesta.</p>
       <p>Data: ${row.data || "da definire"}<br>Ospiti: ${row.ospiti}<br>Pacchetto: ${row.pacchetto}<br>
       Tel: ${row.tel}<br>Email: ${row.email}<br>Zona: ${row.indirizzo}<br>Note: ${row.note || "-"}</p>`
    );
    sendEmail(
      row.email,
      "Richiesta ricevuta — Nero's Kitchen",
      `<p>Ciao ${row.nome}, grazie per la tua richiesta! Ti ricontattiamo entro 24 ore per confermare data e menu.</p>`
    );

    return res.status(200).json(row);
  }

  // ---------- PATCH: aggiorna stato (solo chef) ----------
  if (req.method === "PATCH") {
    if (!checkAdmin(req)) return res.status(401).json({ error: "unauthorized" });
    const { id, stato } = req.body || {};
    if (!id || !stato) return res.status(400).json({ error: "missing_fields" });
    const { data: existing } = await supabase.from("bookings").select("*").eq("id", id).single();
    const { error } = await supabase.from("bookings").update({ stato }).eq("id", id);
    if (error) return res.status(500).json({ error: error.message });

    if (stato === "rifiutata" && existing?.data) {
      await supabase.from("availability").delete().eq("data", existing.data);
    }
    if (existing) {
      sendEmail(
        existing.email,
        stato === "confermata" ? "Prenotazione confermata — Nero's Kitchen" : "Aggiornamento sulla tua richiesta",
        stato === "confermata"
          ? `<p>Ciao ${existing.nome}, la tua prenotazione è confermata! A presto.</p>`
          : `<p>Ciao ${existing.nome}, purtroppo non riusciamo a confermare questa data. Scrivici per trovarne un'altra insieme.</p>`
      );
    }
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "method_not_allowed" });
};
