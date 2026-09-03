import React, { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import { useOutletContext } from "react-router-dom";
import {
  Plus,
  FileText,
  X,
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { TIME_SLOTS } from "@/lib/geo";

export default function Applications() {
  const { role } = useOutletContext();
  const [applications, setApplications] = useState([]);
  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.entities.Application.list("-submitted_date", 100),
      api.entities.Instrument.list(),
    ]).then(([apps, insts]) => {
      setApplications(apps);
      setInstruments(insts);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Applications
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {applications.length} verification application
            {applications.length !== 1 ? "s" : ""}
          </p>
        </div>
        {role !== "admin" && (
          <Button
            onClick={() => setShowForm(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" /> New Application
          </Button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16 text-sm text-muted-foreground">
          Loading…
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">
            No applications yet
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {applications.map((app) => {
            const inst = instruments.find(
              (i) =>
                i.instrument_id === app.instrument_id ||
                i.id === app.instrument_id,
            );
            return (
              <button
                key={app.id}
                onClick={() => setSelected(app)}
                className="w-full text-left rounded-2xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-all hover:border-primary/30"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold">{app.applicant_name}</p>
                      <StatusBadge status={app.application_type} />
                      <StatusBadge status={app.priority} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground font-mono">
                      {app.instrument_id}
                    </p>
                    {inst && (
                      <p className="text-xs text-muted-foreground">
                        {inst.manufacturer} {inst.model} · {inst.location}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={app.status} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {showForm && (
        <ApplicationForm
          instruments={instruments}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            load();
          }}
        />
      )}
      {selected && (
        <ApplicationDetail
          app={selected}
          instrument={instruments.find(
            (i) => i.instrument_id === selected.instrument_id,
          )}
          role={role}
          onClose={() => setSelected(null)}
          onUpdated={() => {
            setSelected(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function ApplicationForm({ instruments, onClose, onSaved }) {
  const [form, setForm] = useState({
    instrument_id: "",
    applicant_name: "",
    applicant_contact: "",
    application_type: "new_verification",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const inst = instruments.find((i) => i.id === form.instrument_id);
    await api.entities.Application.create({
      ...form,
      instrument_id: inst?.instrument_id || form.instrument_id,
      submitted_date: new Date().toISOString().slice(0, 10),
      status: "submitted",
    });
    if (inst)
      await api.entities.Instrument.update(inst.id, {
        status: "pending_verification",
      });
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-card shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-card px-5 py-4">
          <h2 className="font-semibold text-lg">
            New Verification Application
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-accent rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div>
            <label className="text-sm font-medium">
              Select Instrument<span className="text-rose-500"> *</span>
            </label>
            <select
              required
              value={form.instrument_id}
              onChange={(e) => set("instrument_id", e.target.value)}
              className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
            >
              <option value="">Choose an instrument…</option>
              {instruments.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.instrument_id} — {i.owner_name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">
                Applicant Name<span className="text-rose-500"> *</span>
              </label>
              <input
                required
                value={form.applicant_name}
                onChange={(e) => set("applicant_name", e.target.value)}
                className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Contact</label>
              <input
                value={form.applicant_contact}
                onChange={(e) => set("applicant_contact", e.target.value)}
                className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Application Type</label>
            <select
              value={form.application_type}
              onChange={(e) => set("application_type", e.target.value)}
              className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
            >
              <option value="new_verification">New Verification</option>
              <option value="renewal">Renewal</option>
              <option value="re_inspection">Re-inspection</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? "Submitting…" : "Submit Application"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ApplicationDetail({ app, instrument, role, onClose, onUpdated }) {
  const [inspectorName, setInspectorName] = useState(
    app.assigned_inspector || "",
  );
  const [inspectDate, setInspectDate] = useState(app.inspection_date || "");
  const [timeSlot, setTimeSlot] = useState(app.time_slot || "");
  const [saving, setSaving] = useState(false);

  const assignInspector = async () => {
    setSaving(true);
    await api.entities.Application.update(app.id, {
      assigned_inspector: inspectorName,
      inspection_date: inspectDate || null,
      time_slot: timeSlot || null,
      status: "inspector_assigned",
    });
    setSaving(false);
    onUpdated();
  };

  const approve = async () => {
    setSaving(true);
    const inst = instrument;
    const issueDate = new Date().toISOString().slice(0, 10);
    const validUntil = new Date(Date.now() + 365 * 86400000)
      .toISOString()
      .slice(0, 10);
    const certId = `CERT-${Date.now().toString().slice(-8)}`;
    const hash = `${certId}-${app.id}-${issueDate}`.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 24);
    await api.entities.Certificate.create({
      certificate_id: certId,
      instrument_id: app.instrument_id,
      application_id: app.id,
      owner_name: app.applicant_name,
      instrument_type: inst?.instrument_type,
      issue_date: issueDate,
      valid_until: validUntil,
      status: "valid",
      verification_hash: hash,
      issued_by: "Govt. Admin",
    });
    if (inst)
      await api.entities.Instrument.update(inst.id, {
        status: "verified",
        last_verification_date: issueDate,
        next_verification_date: validUntil,
      });
    await api.entities.Application.update(app.id, { status: "approved" });
    setSaving(false);
    onUpdated();
  };

  const reject = async () => {
    setSaving(true);
    await api.entities.Application.update(app.id, { status: "rejected" });
    setSaving(false);
    onUpdated();
  };

  const STEPS = [
    "submitted",
    "document_review",
    "inspector_assigned",
    "inspection_scheduled",
    "inspection_complete",
    "aeve_analysis",
    "government_review",
    "approved",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-card shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-card px-5 py-4">
          <h2 className="font-semibold text-lg">Application Details</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-accent rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5 space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{app.applicant_name}</p>
              <StatusBadge status={app.status} />
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              {app.instrument_id}
            </p>
            {instrument && (
              <p className="text-sm text-muted-foreground">
                {instrument.manufacturer} {instrument.model} ·{" "}
                {instrument.location}
              </p>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Workflow Progress
            </p>
            <div className="space-y-1.5">
              {STEPS.map((step) => {
                const currentIdx = STEPS.indexOf(app.status);
                const stepIdx = STEPS.indexOf(step);
                const done = app.status === "approved" || stepIdx <= currentIdx;
                return (
                  <div key={step} className="flex items-center gap-2.5">
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${done ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"}`}
                    >
                      {done ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        stepIdx + 1
                      )}
                    </div>
                    <span
                      className={`text-xs capitalize ${done ? "text-foreground font-medium" : "text-muted-foreground"}`}
                    >
                      {step.replace(/_/g, " ")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {role === "admin" &&
            !["approved", "rejected"].includes(app.status) && (
              <div className="space-y-3 border-t border-border pt-4">
                {app.status === "submitted" ||
                app.status === "document_review" ? (
                  <div>
                    <label className="text-sm font-medium">
                      Assign Inspector
                    </label>
                    <div className="mt-1 flex gap-2">
                      <input
                        value={inspectorName}
                        onChange={(e) => setInspectorName(e.target.value)}
                        placeholder="Inspector name"
                        className="flex-1 rounded-lg border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
                      />
                      <Button
                        onClick={assignInspector}
                        disabled={!inspectorName || saving}
                        size="sm"
                      >
                        <UserCheck className="h-4 w-4 mr-1" /> Assign
                      </Button>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={inspectDate}
                        onChange={(e) => setInspectDate(e.target.value)}
                        className="rounded-lg border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
                      />
                      <select
                        value={timeSlot}
                        onChange={(e) => setTimeSlot(e.target.value)}
                        className="rounded-lg border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
                      >
                        <option value="">Time slot…</option>
                        {TIME_SLOTS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Optional — the visit date & time slot appear on the
                      inspector field schedule map.
                    </p>
                  </div>
                ) : null}
                <div className="flex gap-2">
                  <Button
                    onClick={approve}
                    disabled={saving}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1.5" /> Approve & Issue
                    Certificate
                  </Button>
                  <Button
                    onClick={reject}
                    disabled={saving}
                    variant="outline"
                    className="text-rose-600 border-rose-200 hover:bg-rose-50"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
