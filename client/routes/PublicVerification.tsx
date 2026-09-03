import React, { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import { useSearchParams, Link } from "react-router-dom";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  MapPin,
  Calendar,
  Award,
  MessageSquareWarning,
  Search,
  ScanLine,
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import QRDisplay from "@/components/QRDisplay";

export default function PublicVerification() {
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("id") || "");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const verify = async (id) => {
    setLoading(true);
    setSearched(true);
    try {
      const instruments = await api.entities.Instrument.filter({
        instrument_id: id,
      });
      const certs = await api.entities.Certificate.filter({
        instrument_id: id,
      });
      const inst = instruments[0];
      const cert = certs[0];
      if (inst) {
        setResult({ instrument: inst, certificate: cert });
      } else if (cert) {
        setResult({ instrument: null, certificate: cert });
      } else {
        setResult(null);
      }
    } catch {
      setResult(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    const id = params.get("id");
    if (id) verify(id);
  }, [params]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) verify(query.trim());
  };

  const isVerified =
    result?.instrument?.status === "verified" &&
    result?.certificate?.status === "valid";
  const isExpired =
    result?.instrument?.status === "expired" ||
    result?.certificate?.status === "expired";

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/30 to-background">
      <div className="mx-auto max-w-lg px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <ScanLine className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">MaanVerify</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Public Instrument Verification Portal
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Instrument or Certificate ID"
              className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "…" : "Verify"}
          </button>
        </form>

        {/* Result */}
        {searched &&
          !loading &&
          (result ? (
            <div className="space-y-4">
              {/* Status banner */}
              <div
                className={`rounded-2xl border-2 p-5 text-center ${isVerified ? "border-emerald-200 bg-emerald-50" : isExpired ? "border-rose-200 bg-rose-50" : "border-amber-200 bg-amber-50"}`}
              >
                {isVerified ? (
                  <ShieldCheck className="mx-auto h-12 w-12 text-emerald-600" />
                ) : isExpired ? (
                  <ShieldX className="mx-auto h-12 w-12 text-rose-600" />
                ) : (
                  <ShieldAlert className="mx-auto h-12 w-12 text-amber-600" />
                )}
                <p
                  className={`mt-3 text-xl font-bold ${isVerified ? "text-emerald-700" : isExpired ? "text-rose-700" : "text-amber-700"}`}
                >
                  {isVerified
                    ? "VERIFIED"
                    : isExpired
                      ? "EXPIRED"
                      : "NOT VERIFIED"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {isVerified
                    ? "This instrument is legally verified and compliant"
                    : isExpired
                      ? "Verification has expired — renewal required"
                      : "No valid verification found"}
                </p>
              </div>

              {/* Details */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
                {result.instrument && (
                  <>
                    <DetailRow
                      label="Instrument ID"
                      value={result.instrument.instrument_id}
                      mono
                    />
                    <DetailRow
                      label="Owner"
                      value={result.instrument.owner_name}
                    />
                    <DetailRow
                      label="Type"
                      value={result.instrument.instrument_type?.replace(
                        /_/g,
                        " ",
                      )}
                    />
                    <DetailRow
                      label="Manufacturer"
                      value={`${result.instrument.manufacturer} ${result.instrument.model || ""}`}
                    />
                    <DetailRow
                      label="Serial Number"
                      value={result.instrument.serial_number}
                      mono
                    />
                    <DetailRow
                      label="Location"
                      value={result.instrument.location}
                      icon={<MapPin className="h-3.5 w-3.5" />}
                    />
                    <DetailRow
                      label="Status"
                      value={<StatusBadge status={result.instrument.status} />}
                    />
                  </>
                )}
                {result.certificate && (
                  <>
                    <div className="border-t border-border pt-3" />
                    <DetailRow
                      label="Certificate ID"
                      value={result.certificate.certificate_id}
                      mono
                    />
                    <DetailRow
                      label="Verified On"
                      value={result.certificate.issue_date}
                      icon={<Calendar className="h-3.5 w-3.5" />}
                    />
                    <DetailRow
                      label="Valid Until"
                      value={result.certificate.valid_until}
                      icon={<Calendar className="h-3.5 w-3.5" />}
                    />
                    <DetailRow
                      label="Certificate Status"
                      value={<StatusBadge status={result.certificate.status} />}
                    />
                  </>
                )}
              </div>

              {isVerified && result.certificate && (
                <div className="flex justify-center">
                  <QRDisplay
                    value={`${typeof window !== "undefined" ? window.location.origin : ""}/verify?id=${result.instrument.instrument_id}`}
                    size={120}
                  />
                </div>
              )}

              <Link
                to="/complaints"
                className="flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 hover:bg-rose-100 transition-colors"
              >
                <MessageSquareWarning className="h-4 w-4" /> Report an Issue
                with this Instrument
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
              <ShieldX className="mx-auto h-12 w-12 text-muted-foreground/40" />
              <p className="mt-3 font-semibold">No Record Found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                No instrument or certificate matches this ID. Please check and
                try again.
              </p>
            </div>
          ))}

        {!searched && (
          <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
            <Award className="mx-auto h-10 w-10 text-primary/40" />
            <p className="mt-3 text-sm text-muted-foreground">
              Enter an Instrument ID or scan a QR code to verify the legal
              status of any weighing or measuring instrument.
            </p>
          </div>
        )}

        <p className="mt-8 text-center text-xs text-muted-foreground">
          MaanVerify · Legal Metrology Verification Platform
        </p>
      </div>
    </div>
  );
}

function DetailRow({ label, value, mono, icon }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="text-muted-foreground flex items-center gap-1 shrink-0">
        {icon}
        {label}
      </span>
      <span
        className={`font-medium text-right ${mono ? "font-mono text-xs" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
