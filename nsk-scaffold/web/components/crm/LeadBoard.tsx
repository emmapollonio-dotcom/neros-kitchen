"use client";

import { useEffect, useState } from "react";

const LEAD_STAGES = ["new", "contacted", "qualified", "proposal", "won", "lost"] as const;
type LeadStage = (typeof LEAD_STAGES)[number];

const STAGE_LABELS: Record<LeadStage, string> = {
  new: "Nuovo",
  contacted: "Contattato",
  qualified: "Qualificato",
  proposal: "Proposta",
  won: "Vinto",
  lost: "Perso",
};

const HOT_LEAD_SCORE_THRESHOLD = 70;

interface Lead {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  source: string | null;
  stage: LeadStage;
  score: number;
  created_at: string;
  followup2_sent_at: string | null;
}

interface Activity {
  id: string;
  type: string;
  content: string;
  created_at: string;
}

// Dashboard CRM: board a colonne per stage + pannello di dettaglio con
// timeline attività. Ogni scrittura passa dalle API /api/v1/crm/*, che si
// appoggiano a RLS ("leads_chef_owner", "crm_activities_chef_owner") come
// unica fonte di verità sui permessi.
export function LeadBoard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newSource, setNewSource] = useState("");
  const [creating, setCreating] = useState(false);

  async function loadLeads() {
    setLoading(true);
    const res = await fetch("/api/v1/crm/leads");
    if (res.ok) {
      const body = await res.json();
      setLeads(body.data);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadLeads();
  }, []);

  async function handleCreateLead(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);

    await fetch("/api/v1/crm/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: newName || undefined,
        email: newEmail || undefined,
        source: newSource || undefined,
      }),
    });

    setCreating(false);
    setNewName("");
    setNewEmail("");
    setNewSource("");
    await loadLeads();
  }

  async function changeStage(leadId: string, stage: LeadStage) {
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, stage } : l)));
    await fetch(`/api/v1/crm/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage }),
    });
  }

  function updateLeadScore(leadId: string, score: number) {
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, score } : l)));
  }

  const hotCount = leads.filter((l) => l.score >= HOT_LEAD_SCORE_THRESHOLD).length;
  const selectedLead = leads.find((l) => l.id === selectedId) ?? null;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
        {LEAD_STAGES.map((stage) => (
          <div key={stage} className="rounded-nsk border border-smoke/15 bg-white p-3 text-center">
            <p className="font-body text-xs text-smoke">{STAGE_LABELS[stage]}</p>
            <p className="font-display text-xl text-charcoal">
              {leads.filter((l) => l.stage === stage).length}
            </p>
          </div>
        ))}
      </div>

      {hotCount > 0 && (
        <p className="font-body text-sm text-teal">
          🔥 {hotCount} lead {hotCount === 1 ? "caldo" : "caldi"} (score ≥ {HOT_LEAD_SCORE_THRESHOLD})
        </p>
      )}

      <form onSubmit={handleCreateLead} className="flex flex-wrap items-end gap-3 rounded-nsk border border-smoke/15 bg-white p-4">
        <div>
          <label className="font-body text-xs text-smoke">Nome</label>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="mt-1 rounded-nsk border border-smoke/30 px-3 py-2 font-body text-sm"
          />
        </div>
        <div>
          <label className="font-body text-xs text-smoke">Email</label>
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="mt-1 rounded-nsk border border-smoke/30 px-3 py-2 font-body text-sm"
          />
        </div>
        <div>
          <label className="font-body text-xs text-smoke">Fonte</label>
          <input
            value={newSource}
            onChange={(e) => setNewSource(e.target.value)}
            placeholder="es. sito, evento, passaparola"
            className="mt-1 rounded-nsk border border-smoke/30 px-3 py-2 font-body text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={creating}
          className="rounded-nsk bg-charcoal px-5 py-2 font-body text-sm text-ivory hover:bg-teal hover:text-white disabled:opacity-50"
        >
          + Aggiungi lead
        </button>
      </form>

      {loading && <p className="font-body text-sm text-smoke">Caricamento...</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {LEAD_STAGES.map((stage) => (
          <div key={stage} className="space-y-2">
            <h3 className="font-body text-xs font-semibold uppercase tracking-wide text-smoke">
              {STAGE_LABELS[stage]}
            </h3>
            {leads
              .filter((l) => l.stage === stage)
              .map((lead) => (
                <button
                  key={lead.id}
                  type="button"
                  onClick={() => setSelectedId(lead.id)}
                  className={`w-full rounded-nsk border p-3 text-left font-body text-sm transition ${
                    selectedId === lead.id
                      ? "border-teal bg-teal/10"
                      : "border-smoke/15 bg-white hover:border-teal"
                  }`}
                >
                  <p className="font-semibold text-charcoal">{lead.full_name ?? "Senza nome"}</p>
                  {lead.email && <p className="text-xs text-smoke">{lead.email}</p>}
                  <p className={`mt-1 text-xs ${lead.score >= HOT_LEAD_SCORE_THRESHOLD ? "text-teal" : "text-smoke"}`}>
                    Score: {lead.score}
                  </p>
                </button>
              ))}
          </div>
        ))}
      </div>

      {selectedLead && (
        <LeadDetailPanel
          lead={selectedLead}
          onStageChange={(stage) => changeStage(selectedLead.id, stage)}
          onQualified={(score) => updateLeadScore(selectedLead.id, score)}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}

function LeadDetailPanel({
  lead,
  onStageChange,
  onQualified,
  onClose,
}: {
  lead: Lead;
  onStageChange: (stage: LeadStage) => void;
  onQualified: (score: number) => void;
  onClose: () => void;
}) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [type, setType] = useState<"note" | "call" | "email" | "meeting">("note");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [qualifying, setQualifying] = useState(false);
  const [qualifyError, setQualifyError] = useState<string | null>(null);

  async function loadActivities() {
    setLoadingActivities(true);
    const res = await fetch(`/api/v1/crm/leads/${lead.id}`);
    if (res.ok) {
      const body = await res.json();
      setActivities(body.data.activities ?? []);
    }
    setLoadingActivities(false);
  }

  useEffect(() => {
    loadActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lead.id]);

  async function handleAddActivity(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSaving(true);

    await fetch(`/api/v1/crm/leads/${lead.id}/activities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, content }),
    });

    setSaving(false);
    setContent("");
    await loadActivities();
  }

  async function handleQualify() {
    setQualifying(true);
    setQualifyError(null);

    const res = await fetch(`/api/v1/crm/leads/${lead.id}/qualify`, { method: "POST" });
    const body = await res.json().catch(() => null);

    if (!res.ok) {
      setQualifyError(body?.error ?? "Errore nella qualificazione del lead.");
    } else {
      if (typeof body?.data?.lead?.score === "number") onQualified(body.data.lead.score);
      await loadActivities();
    }
    setQualifying(false);
  }

  return (
    <div className="rounded-nsk border border-smoke/15 bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-xl text-charcoal">{lead.full_name ?? "Lead senza nome"}</h3>
          <p className="font-body text-sm text-smoke">
            {lead.email ?? "—"} {lead.phone ? `· ${lead.phone}` : ""} {lead.source ? `· fonte: ${lead.source}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleQualify}
            disabled={qualifying}
            className="rounded-nsk bg-charcoal px-4 py-2 font-body text-xs text-ivory hover:bg-teal hover:text-white disabled:opacity-50"
          >
            {qualifying ? "Qualifico..." : "Qualifica con AI"}
          </button>
          <button type="button" onClick={onClose} className="font-body text-sm text-smoke underline">
            Chiudi
          </button>
        </div>
      </div>

      {qualifyError && <p className="mt-2 font-body text-sm text-red-600">{qualifyError}</p>}

      <div className="mt-4">
        <label className="font-body text-xs text-smoke">Stage</label>
        <select
          value={lead.stage}
          onChange={(e) => onStageChange(e.target.value as LeadStage)}
          className="mt-1 rounded-nsk border border-smoke/30 px-3 py-2 font-body text-sm"
        >
          {LEAD_STAGES.map((s) => (
            <option key={s} value={s}>
              {STAGE_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        <h4 className="font-body text-sm font-semibold text-charcoal">Timeline attività</h4>

        {loadingActivities && <p className="mt-2 font-body text-sm text-smoke">Caricamento...</p>}
        {!loadingActivities && activities.length === 0 && (
          <p className="mt-2 font-body text-sm text-smoke">Nessuna attività registrata.</p>
        )}

        <ul className="mt-3 space-y-2">
          {activities.map((a) => (
            <li key={a.id} className="rounded-nsk border border-smoke/15 p-3 font-body text-sm">
              <p className="text-xs uppercase tracking-wide text-teal">{a.type}</p>
              <p className="mt-1 text-charcoal">{a.content}</p>
              <p className="mt-1 text-xs text-smoke">
                {new Date(a.created_at).toLocaleString("it-IT")}
              </p>
            </li>
          ))}
        </ul>

        <form onSubmit={handleAddActivity} className="mt-4 space-y-2">
          <div className="flex gap-2">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as typeof type)}
              className="rounded-nsk border border-smoke/30 px-3 py-2 font-body text-sm"
            >
              <option value="note">Nota</option>
              <option value="call">Chiamata</option>
              <option value="email">Email</option>
              <option value="meeting">Incontro</option>
            </select>
            <input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Cosa è successo?"
              className="flex-1 rounded-nsk border border-smoke/30 px-3 py-2 font-body text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-nsk bg-charcoal px-5 py-2 font-body text-sm text-ivory hover:bg-teal hover:text-white disabled:opacity-50"
          >
            {saving ? "Salvataggio..." : "Aggiungi attività"}
          </button>
        </form>
      </div>
    </div>
  );
}
