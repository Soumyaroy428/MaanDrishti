import React, { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import { Plus, X, Settings, CheckCircle2 } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";

const TYPES = [
  { value: "electronic_weighing_scale", label: "Electronic Weighing Scale" },
  { value: "weighbridge", label: "Weighbridge" },
  { value: "fuel_dispenser", label: "Fuel Dispenser" },
  { value: "measuring_cylinder", label: "Measuring Cylinder" },
  { value: "retail_weighing_machine", label: "Retail Weighing Machine" },
  { value: "industrial_equipment", label: "Industrial Equipment" },
  { value: "other", label: "Other" },
];

export default function ToleranceRules() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    setLoading(true);
    api.entities.ToleranceRule.list().then((data) => {
      setRules(data);
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
            Tolerance Rules
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configurable metrological tolerance limits by instrument type
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" /> Add Rule
        </Button>
      </div>

      <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 flex gap-3">
        <Settings className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-800">
          The verification engine compares measurement error against these
          configurable tolerance rules. Tolerance is expressed as a percentage
          of the expected value. Rules should align with applicable legal
          metrology standards.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-sm text-muted-foreground">
          Loading…
        </div>
      ) : rules.length === 0 ? (
        <div className="text-center py-16">
          <Settings className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">
            No tolerance rules configured. Using default 1% tolerance.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Instrument Type
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Category
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Capacity
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Tolerance
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rules.map((r) => (
                  <tr key={r.id} className="hover:bg-accent/30">
                    <td className="px-4 py-3 font-medium">
                      {TYPES.find((t) => t.value === r.instrument_type)
                        ?.label || r.instrument_type}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {r.category || "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {r.capacity_min || r.capacity_max
                        ? `${r.capacity_min || 0} – ${r.capacity_max || "∞"}`
                        : "All"}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {r.tolerance_percentage}%
                    </td>
                    <td className="px-4 py-3">
                      {r.active !== false ? (
                        <StatusBadge status="active" />
                      ) : (
                        <StatusBadge status="pending" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <RuleForm
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function RuleForm({ onClose, onSaved }) {
  const [form, setForm] = useState({
    instrument_type: "electronic_weighing_scale",
    category: "Class III",
    capacity_min: "",
    capacity_max: "",
    tolerance_percentage: "1",
    description: "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await api.entities.ToleranceRule.create({
      ...form,
      capacity_min: form.capacity_min
        ? parseFloat(form.capacity_min)
        : undefined,
      capacity_max: form.capacity_max
        ? parseFloat(form.capacity_max)
        : undefined,
      tolerance_percentage: parseFloat(form.tolerance_percentage),
      active: true,
    });
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-card shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-card px-5 py-4">
          <h2 className="font-semibold text-lg">Add Tolerance Rule</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-accent rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div>
            <label className="text-sm font-medium">Instrument Type</label>
            <select
              value={form.instrument_type}
              onChange={(e) => set("instrument_type", e.target.value)}
              className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Accuracy Category</label>
              <input
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                placeholder="e.g. Class III"
                className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                Tolerance (%)<span className="text-rose-500"> *</span>
              </label>
              <input
                required
                type="number"
                step="0.01"
                value={form.tolerance_percentage}
                onChange={(e) => set("tolerance_percentage", e.target.value)}
                className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Min Capacity</label>
              <input
                type="number"
                value={form.capacity_min}
                onChange={(e) => set("capacity_min", e.target.value)}
                className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Max Capacity</label>
              <input
                type="number"
                value={form.capacity_max}
                onChange={(e) => set("capacity_max", e.target.value)}
                className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={2}
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
              <CheckCircle2 className="h-4 w-4 mr-2" />{" "}
              {saving ? "Saving…" : "Save Rule"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
