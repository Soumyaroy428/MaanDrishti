import React, { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import { useOutletContext } from "react-router-dom";
import {
  Plus,
  Search,
  Scale,
  MapPin,
  X,
  Calendar,
  CheckCircle2,
} from "lucide-react";
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

export default function Instruments() {
  const { role } = useOutletContext();
  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const load = () => {
    setLoading(true);
    api.entities.Instrument.list("-created_date", 100).then((data) => {
      setInstruments(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = instruments.filter((i) => {
    const matchSearch =
      !search ||
      i.instrument_id?.toLowerCase().includes(search.toLowerCase()) ||
      i.owner_name?.toLowerCase().includes(search.toLowerCase()) ||
      i.serial_number?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || i.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Instruments
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {instruments.length} registered instrument
            {instruments.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" /> Register Instrument
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, owner or serial number…"
            className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
        >
          <option value="all">All Status</option>
          <option value="registered">Registered</option>
          <option value="pending_verification">Pending</option>
          <option value="verified">Verified</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-16 text-sm text-muted-foreground">
          Loading instruments…
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Scale className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">
            No instruments found
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((inst) => (
            <div
              key={inst.id}
              className="rounded-2xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-mono text-xs text-muted-foreground truncate">
                    {inst.instrument_id}
                  </p>
                  <p className="mt-0.5 font-semibold truncate">
                    {inst.owner_name}
                  </p>
                </div>
                <StatusBadge status={inst.status} />
              </div>
              <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">
                    {TYPES.find((t) => t.value === inst.instrument_type)
                      ?.label || inst.instrument_type}
                  </span>
                </p>
                <p>
                  {inst.manufacturer} {inst.model}
                </p>
                <p className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {inst.location}
                  {inst.district ? `, ${inst.district}` : ""}
                </p>
                {inst.next_verification_date && (
                  <p className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Valid till:{" "}
                    {inst.next_verification_date}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <RegisterForm
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

function RegisterForm({ onClose, onSaved }) {
  const [form, setForm] = useState({
    owner_name: "",
    manufacturer: "",
    model: "",
    serial_number: "",
    capacity: "",
    instrument_type: "electronic_weighing_scale",
    location: "",
    district: "",
    installation_date: "",
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const prefix = "WB";
    const year = new Date().getFullYear();
    const random = String(Math.floor(Math.random() * 90000) + 1000).padStart(
      5,
      "0",
    );
    const instrument_id = `${prefix}-${form.instrument_type.slice(0, 2).toUpperCase()}-${year}-${random}`;
    await api.entities.Instrument.create({
      ...form,
      instrument_id,
      status: "registered",
    });
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-card shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-card px-5 py-4">
          <h2 className="font-semibold text-lg">Register New Instrument</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-accent rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <Field
            label="Owner / Business Name"
            required
            value={form.owner_name}
            onChange={(v) => set("owner_name", v)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Manufacturer"
              required
              value={form.manufacturer}
              onChange={(v) => set("manufacturer", v)}
            />
            <Field
              label="Model"
              value={form.model}
              onChange={(v) => set("model", v)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Serial Number"
              required
              value={form.serial_number}
              onChange={(v) => set("serial_number", v)}
            />
            <Field
              label="Capacity (e.g. 30 kg)"
              value={form.capacity}
              onChange={(v) => set("capacity", v)}
            />
          </div>
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
            <Field
              label="Location"
              required
              value={form.location}
              onChange={(v) => set("location", v)}
            />
            <Field
              label="District"
              value={form.district}
              onChange={(v) => set("district", v)}
            />
          </div>
          <Field
            label="Installation / Purchase Date"
            type="date"
            value={form.installation_date}
            onChange={(v) => set("installation_date", v)}
          />
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
              {saving ? "Saving…" : "Register"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, required, type = "text" }) {
  return (
    <div>
      <label className="text-sm font-medium">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </label>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}
