"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

const CONTROL_POINT_TYPES = ["frigo", "freezer", "cella", "banco_caldo", "altro"] as const;
type ControlPointType = (typeof CONTROL_POINT_TYPES)[number];

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

// Tracker HACCP: gestione punti di controllo + log rilevazioni + azioni
// correttive AI on-demand sulle non conformità. Ogni scrittura passa da
// /api/v1/haccp/*, che si appoggia a RLS ("haccp_*_owner") come unica fonte
// di verità sui permessi. Il giudizio di conformità è calcolato server-side
// (lib/haccp/check-reading.ts), qui mostrato solo per come l'ha già deciso l'API.
export function HaccpTracker() {
  const t = useTranslations("haccp");
  const locale = useLocale();
  const TYPE_LABELS: Record<ControlPointType, string> = {
    frigo: t("typeFrigo"),
    freezer: t("typeFreezer"),
    cella: t("typeCella"),
    banco_caldo: t("typeBancoCaldo"),
    altro: t("typeAltro"),
  };
  const URGENCY_LABELS: Record<CorrectiveAction["urgency"], string> = {
    bassa: t("urgencyLow"),
    media: t("urgencyMedium"),
    alta: t("urgencyHigh"),
  };
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
      setError(typeof body?.error === "string" ? body.error : t("errorCreatingPoint"));
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
      setError(typeof body?.error === "string" ? body.error : t("errorRecording"));
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
      setError(typeof body?.error === "string" ? body.error : t("errorGeneratingAction"));
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
        <h2 className="font-body text-sm font-semibold text-charcoal">{t("controlPointsTitle")}</h2>

        <form onSubmit={handleCreateControlPoint} className="mt-3 flex flex-wrap items-end gap-3">
          <div>
            <label className="font-body text-xs text-smoke">{t("nameLabel")}</label>
            <input
              value={cpName}
              onChange={(e) => setCpName(e.target.value)}
              placeholder={t("namePlaceholder")}
              required
              className="mt-1 rounded-nsk border border-smoke/30 px-3 py-2 font-body text-sm"
            />
          </div>
          <div>
            <label className="font-body text-xs text-smoke">{t("typeLabel")}</label>
            <select
              value={cpType}
              onChange={(e) => setCpType(e.target.value as ControlPointType)}
              className="mt-1 rounded-nsk border border-smoke/30 px-3 py-2 font-body text-sm"
            >
              {CONTROL_POINT_TYPES.map((cpt) => (
                <option key={cpt} value={cpt}>
                  {TYPE_LABELS[cpt]}
                </option>
              ))}
            </select>
          </div>
          <div className="w-24">
            <label className="font-body text-xs text-smoke">{t("minLabel")}</label>
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
            <label className="font-body text-xs text-smoke">{t("maxLabel")}</label>
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
            className="rounded-nsk bg-charcoal px-5 py-2 font-body text-sm text-ivory hover:bg-teal hover:text-white disabled:opacity-50"
          >
            {creatingCp ? t("saving") : t("addPoint")}
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
                  aria-label={t("deleteAria", { name: cp.name })}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-nsk border border-smoke/15 bg-white p-4">
        <h2 className="font-body text-sm font-semibold text-charcoal">{t("recordReadingTitle")}</h2>

        {controlPoints.length === 0 ? (
          <p className="mt-2 font-body text-sm text-smoke">{t("addPointFirst")}</p>
        ) : (
          <form onSubmit={handleCreateReading} className="mt-3 flex flex-wrap items-end gap-3">
            <div>
              <label className="font-body text-xs text-smoke">{t("controlPointLabel")}</label>
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
              <label className="font-body text-xs text-smoke">{t("temperatureLabel")}</label>
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
              <label className="font-body text-xs text-smoke">{t("noteLabel")}</label>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-1 rounded-nsk border border-smoke/30 px-3 py-2 font-body text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={creatingReading}
              className="rounded-nsk bg-charcoal px-5 py-2 font-body text-sm text-ivory hover:bg-teal hover:text-white disabled:opacity-50"
            >
              {creatingReading ? t("saving") : t("register")}
            </button>
          </form>
        )}
      </div>

      {error && <p className="font-body text-sm text-red-600">{error}</p>}
      {loading && <p className="font-body text-sm text-smoke">{t("loading")}</p>}
      {!loading && readings.length === 0 && (
        <p className="font-body text-sm text-smoke">{t("noReadings")}</p>
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
                  {reading.is_non_conforming ? t("nonConforming") : t("conforming")} ·{" "}
                  {new Date(reading.recorded_at).toLocaleString(locale)}
                  {reading.note ? ` · ${reading.note}` : ""}
                </p>
              </div>
              {reading.is_non_conforming && (
                <button
                  type="button"
                  onClick={() => handleGenerateAction(reading.id)}
                  disabled={generatingId === reading.id}
                  className="rounded-nsk border border-teal px-3 py-1.5 font-body text-xs text-charcoal hover:bg-teal/10 disabled:opacity-50"
                >
                  {generatingId === reading.id ? t("generating") : t("correctiveActionAi")}
                </button>
              )}
            </div>

            {expandedReadingId === reading.id && actionsByReading[reading.id] && (
              <div className="mt-4 space-y-2 border-t border-smoke/10 pt-4">
                {actionsByReading[reading.id].length === 0 && (
                  <p className="font-body text-xs text-smoke">{t("noActionsGenerated")}</p>
                )}
                {actionsByReading[reading.id].map((a) => (
                  <div key={a.id} className="rounded-nsk border border-teal/40 bg-teal/10 p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-body text-sm font-semibold text-charcoal">{a.title}</p>
                      <p className="font-body text-xs uppercase tracking-wide text-teal">
                        {t("urgencyPrefix", { urgency: URGENCY_LABELS[a.urgency] })}
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
