"use client";

import { useEffect, useState } from "react";

const CONTROL_POINT_TYPES = ["frigo", "freezer", "cella", "banco_caldo", "altro"] as const;
type ControlPointType = (typeof CONTROL_POINT_TYPES)[number];

const TYPE_LABELS: Record<ControlPointType, string> = {
  frigo: "Frigo",
  freezer: "Freezer",
  cella: "Cella",
  banco_caldo: "Banco caldo",
  altro: "Altro",
};

interface ControlPoint {
  id: string;
  name: string;
  type: ControlPointType;
  temp_min: number;
  temp_max: number;
  active: boolean;
}

interface Reading {
  id: string;
  control_point_id: string;
  temperature: number;
  is_non_conforming: boolean;
  note: string | null;
  recorded_at: string;
}

interface CorrectiveAction {
  id: string;
  title: string;
  content: string;
  urgency: "bassa" | "media" | "alta";
  created_at: string;
}

const URGENCY_LABELS: Record<CorrectiveAction["urgency"], string> = {
  bassa: "Bassa",
  media: "Media",
  alta: "Alta",
};

// Tracker HACCP: gestione punti di controllo + log rilevazioni + azioni
// correttive AI on-demand sulle non conformità. Ogni scrittura passa da
// /api/v1/haccp/*, che si appoggia a RLS ("haccp_*_owner") come unica fonte
// di verità sui permessi. Il giudizio di conformità è calcolato server-side
// (lib/haccp/check-reading.ts), qui mostrato solo per come l'ha già deciso l'API.
export function HaccpTracker() {
  const [controlPoints, setControlPoints] = useState<ControlPoint[]>([]);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [cpName, setCpName] = useState("");
  const [cpType, setCpType] = useState<ControlPointType>("frigo");
  const [cpMin, setCpMin] = useState("0");
  const [cpMax, setCpMax] = useState("4");
  const [creatingCp, setCreatingCp] = useState(false);

  const [selectedCpId, setSelectedCpId] = useState<string>("");
  const [temperature, setTemperature] = useState("");
  const [note, setNote] = useState("");
  const [creatingReading, setCreatingReading] = useState(false);

  const [expandedReadingId, setExpandedReadingId] = useState<string | null>(null);
  const [actionsByReading, setActionsByReading] = useState<Record<string, CorrectiveAction[]>>({});
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  async function loadAll() {
    setLoading(true);
    const [cpRes, readingsRes] = await Promise.all([
      fetch("/api/v1/haccp/control-points"),
      fetch("/api/v1/haccp/readings"),
    ]);
    if (cpRes.ok) {
      const body = await cpRes.json();
      const points: ControlPoint[] = body.data ?? [];
      setControlPoints(points);
      if (!selectedCpId && points.length > 0) setSelectedCpId(points[0].id);
    }
    if (readingsRes.ok) {
      const body = await readingsRes.json();
      setReadings(body.data ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreateControlPoint(e: React.FormEvent) {
    e.preventDefault();
    if (!cpName.trim()) return;
    setCreatingCp(true);
    setError(null);

    const res = await fetch("/api/v1/haccp/control-points", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: cpName.trim(),
        type: cpType,
        temp_min: Number(cpMin),
        temp_max: Number(cpMax),
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(typeof body?.error === "string" ? body.error : "Errore nella creazione del punto di controllo.");
    } else {
      setCpName("");
    }
    setCreatingCp(false);
    await loadAll();
  }

  async function handleDeleteControlPoint(id: string) {
    setControlPoints((prev) => prev.filter((c) => c.id !== id));
    await fetch(`/api/v1/haccp/control-points/${id}`, { method: "DELETE" });
    await loadAll();
  }

  async function handleCreateReading(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCpId || !temperature) return;
    setCreatingReading(true);
    setError(null);

    const res = await fetch("/api/v1/haccp/readings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        control_point_id: selectedCpId,
        temperature: Number(temperature),
        note: note || undefined,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(typeof body?.error === "string" ? body.error : "Errore nella registrazione.");
    } else {
      setTemperature("");
      setNote("");
    }
    setCreatingReading(false);
    await loadAll();
  }

  async function handleGenerateAction(readingId: string) {
    setGeneratingId(readingId);
    setError(null);
    setExpandedReadingId(readingId);

    const res = await fetch(`/api/v1/haccp/readings/${readingId}/corrective-action`, {
      method: "POST",
    });
    const body = await res.json().catch(() => null);

    if (!res.ok) {
      setError(typeof body?.error === "string" ? body.error : "Errore nella generazione dell'azione correttiva.");
    } else {
      setActionsByReading((prev) => ({ ...prev, [readingId]: body.data.actions ?? [] }));
    }
    setGeneratingId(null);
  }

  function controlPointLabel(id: string) {
    const cp = controlPoints.find((c) => c.id === id);
    return cp ? `${cp.name} (${TYPE_LABELS[cp.type]})` : "—";
  }

  return (
    <div className="space-y-8">
      <div className="rounded-nsk border border-smoke/15 bg-white p-4">
        <h2 className="font-body text-sm font-semibold text-charcoal">Punti di controllo</h2>

        <form onSubmit={handleCreateControlPoint} className="mt-3 flex flex-wrap items-end gap-3">
          <div>
            <label className="font-body text-xs text-smoke">Nome</label>
            <input
              value={cpName}
              onChange={(e) => setCpName(e.target.value)}
              placeholder="es. Frigo cucina"
              required
              className="mt-1 rounded-nsk border border-smoke/30 px-3 py-2 font-body text-sm"
            />
          </div>
          <div>
            <label className="font-body text-xs text-smoke">Tipo</label>
            <select
              value={cpType}
              onChange={(e) => setCpType(e.target.value as ControlPointType)}
              className="mt-1 rounded-nsk border border-smoke/30 px-3 py-2 font-body text-sm"
            >
              {CONTROL_POINT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </div>
          <div className="w-24">
            <label className="font-body text-xs text-smoke">Min °C</label>
            <input
              type="number"
              step="0.1"
              value={cpMin}
              onChange={(e) => setCpMin(e.target.value)}
              required
              className="mt-1 w-full rounded-nsk border border-smoke/30 px-3 py-2 font-body text-sm"
            />
          </div>
          <div className="w-24">
            <label className="font-body text-xs text-smoke">Max °C</label>
            <input
              type="number"
              step="0.1"
              value={cpMax}
              onChange={(e) => setCpMax(e.target.value)}
              required
              className="mt-1 w-full rounded-nsk border border-smoke/30 px-3 py-2 font-body text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={creatingCp}
            className="rounded-nsk bg-charcoal px-5 py-2 font-body text-sm text-ivory hover:bg-gold hover:text-charcoal disabled:opacity-50"
          >
            {creatingCp ? "Salvataggio..." : "+ Aggiungi punto"}
          </button>
        </form>

        {controlPoints.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {controlPoints.map((cp) => (
              <li
                key={cp.id}
                className="flex items-center gap-2 rounded-nsk border border-smoke/15 px-3 py-1.5 font-body text-xs text-charcoal"
              >
                {cp.name} · {TYPE_LABELS[cp.type]} · {cp.temp_min}/{cp.temp_max}°C
                <button
                  type="button"
                  onClick={() => handleDeleteControlPoint(cp.id)}
                  className="text-smoke hover:text-red-600"
                  aria-label={`Elimina ${cp.name}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-nsk border border-smoke/15 bg-white p-4">
        <h2 className="font-body text-sm font-semibold text-charcoal">Registra rilevazione</h2>

        {controlPoints.length === 0 ? (
          <p className="mt-2 font-body text-sm text-smoke">
            Aggiungi prima almeno un punto di controllo.
          </p>
        ) : (
          <form onSubmit={handleCreateReading} className="mt-3 flex flex-wrap items-end gap-3">
            <div>
              <label className="font-body text-xs text-smoke">Punto di controllo</label>
              <select
                value={selectedCpId}
                onChange={(e) => setSelectedCpId(e.target.value)}
                className="mt-1 rounded-nsk border border-smoke/30 px-3 py-2 font-body text-sm"
              >
                {controlPoints.map((cp) => (
                  <option key={cp.id} value={cp.id}>
                    {cp.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-28">
              <label className="font-body text-xs text-smoke">Temperatura °C</label>
              <input
                type="number"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                required
                className="mt-1 w-full rounded-nsk border border-smoke/30 px-3 py-2 font-body text-sm"
              />
            </div>
            <div>
              <label className="font-body text-xs text-smoke">Nota (opzionale)</label>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-1 rounded-nsk border border-smoke/30 px-3 py-2 font-body text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={creatingReading}
              className="rounded-nsk bg-charcoal px-5 py-2 font-body text-sm text-ivory hover:bg-gold hover:text-charcoal disabled:opacity-50"
            >
              {creatingReading ? "Salvataggio..." : "Registra"}
            </button>
          </form>
        )}
      </div>

      {error && <p className="font-body text-sm text-red-600">{error}</p>}
      {loading && <p className="font-body text-sm text-smoke">Caricamento...</p>}
      {!loading && readings.length === 0 && (
        <p className="font-body text-sm text-smoke">Nessuna rilevazione registrata finora.</p>
      )}

      <ul className="space-y-3">
        {readings.map((reading) => (
          <li key={reading.id} className="rounded-nsk border border-smoke/15 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-body font-semibold text-charcoal">
                  {controlPointLabel(reading.control_point_id)}{" "}
                  <span className="font-normal text-smoke">· {reading.temperature}°C</span>
                </p>
                <p
                  className={`font-body text-xs ${
                    reading.is_non_conforming ? "text-red-600" : "text-smoke"
                  }`}
                >
                  {reading.is_non_conforming ? "Non conforme" : "Conforme"} ·{" "}
                  {new Date(reading.recorded_at).toLocaleString("it-IT")}
                  {reading.note ? ` · ${reading.note}` : ""}
                </p>
              </div>
              {reading.is_non_conforming && (
                <button
                  type="button"
                  onClick={() => handleGenerateAction(reading.id)}
                  disabled={generatingId === reading.id}
                  className="rounded-nsk border border-gold px-3 py-1.5 font-body text-xs text-charcoal hover:bg-gold/10 disabled:opacity-50"
                >
                  {generatingId === reading.id ? "Genero..." : "Azione correttiva AI"}
                </button>
              )}
            </div>

            {expandedReadingId === reading.id && actionsByReading[reading.id] && (
              <div className="mt-4 space-y-2 border-t border-smoke/10 pt-4">
                {actionsByReading[reading.id].length === 0 && (
                  <p className="font-body text-xs text-smoke">Nessuna azione generata.</p>
                )}
                {actionsByReading[reading.id].map((a) => (
                  <div key={a.id} className="rounded-nsk border border-gold/40 bg-gold/10 p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-body text-sm font-semibold text-charcoal">{a.title}</p>
                      <p className="font-body text-xs uppercase tracking-wide text-gold">
                        Urgenza: {URGENCY_LABELS[a.urgency]}
                      </p>
                    </div>
                    <p className="mt-1 whitespace-pre-wrap font-body text-sm text-charcoal">
                      {a.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
