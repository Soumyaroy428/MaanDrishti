import React, { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import { useOutletContext } from "react-router-dom";
import {
  Plus,
  MessageSquareWarning,
  X,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";

const TYPES = [
  { value: "incorrect_reading", label: "Incorrect Reading" },
  { value: "fake_certificate", label: "Fake Certificate" },
  { value: "expired_instrument", label: "Expired Instrument" },
  { value: "tampered_instrument", label: "Tampered Instrument" },
  { value: "no_certificate", label: "No Certificate" },
  { value: "other", label: "Other" },
];

export default function Complaints() {
  const { role } = useOutletContext();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);

  const load = () => {
    setLoading(true);
    api.entities.Complaint.list("-submitted_date", 100).then((data) => {
      setComplaints(data);
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
            {role === "admin" ? "Complaint Management" : "Report an Issue"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {complaints.length} complaint{complaints.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" /> New Complaint
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-sm text-muted-foreground">
          Loading…
        </div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-16">
          <MessageSquareWarning className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">
            No complaints filed yet
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {complaints.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelected(c)}
              className="w-full text-left rounded-2xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-all hover:border-primary/30"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={c.complaint_type} />
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="mt-1.5 text-sm font-medium truncate">
                    {c.complainant_name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {c.description}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground shrink-0 sm:text-right">
                  {c.submitted_date}
                  {c.location && (
                    <p className="flex items-center gap-1 sm:justify-end">
                      <MapPin className="h-3 w-3" /> {c.location}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {showForm && (
        <ComplaintForm
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            load();
          }}
        />
      )}
      {selected && (
        <ComplaintDetail
          complaint={selected}
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

function ComplaintForm({ onClose, onSaved }) {
  const [form, setForm] = useState({
    complainant_name: "",
    complainant_contact: "",
    complaint_type: "incorrect_reading",
    description: "",
    location: "",
    instrument_id: "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await api.entities.Complaint.create({
      ...form,
      submitted_date: new Date().toISOString().slice(0, 10),
      status: "submitted",
    });
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-card shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-card px-5 py-4">
          <h2 className="font-semibold text-lg">File a Complaint</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-accent rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">
                Your Name<span className="text-rose-500"> *</span>
              </label>
              <input
                required
                value={form.complainant_name}
                onChange={(e) => set("complainant_name", e.target.value)}
                className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Contact</label>
              <input
                value={form.complainant_contact}
                onChange={(e) => set("complainant_contact", e.target.value)}
                className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Complaint Type</label>
            <select
              value={form.complaint_type}
              onChange={(e) => set("complaint_type", e.target.value)}
              className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">
              Instrument ID (optional)
            </label>
            <input
              value={form.instrument_id}
              onChange={(e) => set("instrument_id", e.target.value)}
              placeholder="e.g. WB-WB-2026-001245"
              className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Location</label>
            <input
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-sm font-medium">
              Description<span className="text-rose-500"> *</span>
            </label>
            <textarea
              required
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={4}
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
              {saving ? "Submitting…" : "Submit Complaint"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ComplaintDetail({ complaint, role, onClose, onUpdated }) {
  const [status, setStatus] = useState(complaint.status);
  const [notes, setNotes] = useState(complaint.resolution_notes || "");
  const [saving, setSaving] = useState(false);

  const update = async () => {
    setSaving(true);
    await api.entities.Complaint.update(complaint.id, {
      status,
      resolution_notes: notes,
    });
    setSaving(false);
    onUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-card shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-card px-5 py-4">
          <h2 className="font-semibold text-lg">Complaint Details</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-accent rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={complaint.complaint_type} />
            <StatusBadge status={complaint.status} />
          </div>
          <div className="space-y-2 text-sm">
            <Row label="Complainant" value={complaint.complainant_name} />
            <Row label="Contact" value={complaint.complainant_contact || "—"} />
            <Row
              label="Instrument ID"
              value={complaint.instrument_id || "—"}
              mono
            />
            <Row label="Location" value={complaint.location || "—"} />
            <Row label="Filed on" value={complaint.submitted_date} />
          </div>
          <div className="rounded-xl bg-muted/30 p-3">
            <p className="text-xs font-semibold text-muted-foreground mb-1">
              Description
            </p>
            <p className="text-sm">{complaint.description}</p>
          </div>

          {role === "admin" && (
            <div className="space-y-3 border-t border-border pt-4">
              <div>
                <label className="text-sm font-medium">Update Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
                >
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="investigating">Investigating</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Resolution Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>
              <Button onClick={update} disabled={saving} className="w-full">
                <CheckCircle2 className="h-4 w-4 mr-2" />{" "}
                {saving ? "Saving…" : "Update Complaint"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, mono }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={`font-medium text-right ${mono ? "font-mono text-xs" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
