import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ScanLine,
  Search,
  ShieldCheck,
  MessageSquareWarning,
  Info,
} from "lucide-react";

export default function CitizenDashboard() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleVerify = (e) => {
    e.preventDefault();
    if (query.trim())
      navigate(`/verify?id=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="space-y-6">
      <div className="text-center pt-4 sm:pt-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ScanLine className="h-8 w-8" />
        </div>
        <h1 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight">
          Verify an Instrument
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground max-w-md mx-auto">
          Enter an Instrument ID or Certificate ID to check verification status
          instantly
        </p>
      </div>

      <form onSubmit={handleVerify} className="mx-auto max-w-lg">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. WB-WB-2026-001245"
              className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Verify
          </button>
        </div>
      </form>

      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 max-w-lg mx-auto">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <ShieldCheck className="h-8 w-8 text-emerald-600" />
          <h3 className="mt-3 font-semibold text-sm">Instant Verification</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Check if any weighing or measuring instrument is legally verified
          </p>
        </div>
        <button
          onClick={() => navigate("/complaints")}
          className="text-left rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <MessageSquareWarning className="h-8 w-8 text-rose-600" />
          <h3 className="mt-3 font-semibold text-sm">Report an Issue</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            File a complaint about a suspected non-compliant instrument
          </p>
        </button>
      </div>

      <div className="mx-auto max-w-lg rounded-xl bg-blue-50 border border-blue-100 p-4 flex gap-3">
        <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-800">
          You can also scan the QR code printed on any verified instrument's
          certificate to open this verification page automatically.
        </p>
      </div>
    </div>
  );
}
