// /api/availability.js
// GET  (pubblica): restituisce le date bloccate/occupate { "2026-07-28": "blocked" }
// POST (solo chef): blocca/sblocca manualmente una data

const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-password");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    const { data, error } = await supabase.from("availability").select("data, stato");
    if (error) return res.status(500).json({ error: error.message });
    const out = {};
    (data || []).forEach((r) => (out[r.data] = r.stato));
    return res.status(200).json(out);
  }

  if (req.method === "POST") {
    if (req.headers["x-admin-password"] !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: "unauthorized" });
    }
    const { date, action } = req.body || {};
    if (!date || !action) return res.status(400).json({ error: "missing_fields" });
    if (action === "block") {
      const { error } = await supabase.from("availability").upsert({ data: date, stato: "blocked" });
      if (error) return res.status(500).json({ error: error.message });
    } else {
      const { error } = await supabase.from("availability").delete().eq("data", date);
      if (error) return res.status(500).json({ error: error.message });
    }
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "method_not_allowed" });
};
