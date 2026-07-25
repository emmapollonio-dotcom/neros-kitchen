// /api/dishes.js
// GET pubblico: restituisce il catalogo piatti attivi, raggruppabile per categoria lato client.

const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "method_not_allowed" });

  const { data, error } = await supabase
    .from("piatti")
    .select("id, nome, categoria, descrizione, allergeni, prezzo")
    .eq("attivo", true)
    .order("categoria", { ascending: true })
    .order("ordine", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data);
};
