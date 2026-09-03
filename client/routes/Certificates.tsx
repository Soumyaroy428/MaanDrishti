import React, { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import {
  Award,
  X,
  Download,
  Share2,
  Calendar,
  Building2,
  ScanLine,
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import QRDisplay from "@/components/QRDisplay";
import { Button } from "@/components/ui/button";

export default function Certificates() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.entities.Certificate.list("-issue_date", 100).then((data) => {
      setCerts(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Certificates
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {certs.length} digital certificate{certs.length !== 1 ? "s" : ""}{" "}
          issued
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-sm text-muted-foreground">
          Loading…
        </div>
      ) : certs.length === 0 ? (
        <div className="text-center py-16">
          <Award className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">
            No certificates issued yet
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {certs.map((cert) => (
            <button
              key={cert.id}
              onClick={() => setSelected(cert)}
              className="text-left rounded-2xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-all hover:border-primary/30"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Award className="h-5 w-5" />
                </div>
                <StatusBadge status={cert.status} />
              </div>
              <p className="mt-3 font-mono text-xs text-muted-foreground truncate">
                {cert.certificate_id}
              </p>
              <p className="mt-0.5 font-semibold truncate">{cert.owner_name}</p>
              <div className="mt-2 text-xs text-muted-foreground space-y-0.5">
                <p>Issued: {cert.issue_date}</p>
                <p>Valid till: {cert.valid_until}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <CertificateView cert={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function CertificateView({ cert, onClose }) {
  const verifyUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/verify?id=${cert.instrument_id}`;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full sm:max-w-md max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-card shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-card px-5 py-4">
          <h2 className="font-semibold text-lg">Digital Certificate</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-accent rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Certificate body */}
        <div className="p-5">
          <div className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-blue-50/50 to-emerald-50/50 p-5 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <ScanLine className="h-4 w-4" />
              </div>
              <span className="font-bold text-primary">MaanVerify</span>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Certificate of Verification
            </p>
            <div className="my-4 flex justify-center">
              <QRDisplay value={verifyUrl} size={140} />
            </div>
            <p className="font-mono text-xs text-muted-foreground break-all">
              {cert.certificate_id}
            </p>
            <p className="mt-2 text-lg font-bold">{cert.owner_name}</p>
            <p className="text-sm text-muted-foreground capitalize">
              {cert.instrument_type?.replace(/_/g, " ")}
            </p>
            <div className="mt-4 flex justify-center gap-6 text-xs">
              <div>
                <p className="text-muted-foreground">Issued</p>
                <p className="font-semibold">{cert.issue_date}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Valid Until</p>
                <p className="font-semibold">{cert.valid_until}</p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-border/50">
              <p className="text-[10px] text-muted-foreground">
                Verification Hash
              </p>
              <p className="font-mono text-[10px] text-foreground/70 break-all">
                {cert.verification_hash}
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4" /> Instrument:{" "}
              <span className="font-mono text-foreground">
                {cert.instrument_id}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" /> Issued by:{" "}
              <span className="text-foreground">
                {cert.issued_by || "Govt. Admin"}
              </span>
            </div>
          </div>

          <div className="mt-5 flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() =>
                navigator.share?.({ url: verifyUrl }) ||
                navigator.clipboard?.writeText(verifyUrl)
              }
            >
              <Share2 className="h-4 w-4 mr-2" /> Share
            </Button>
            <Button className="flex-1" onClick={() => window.open(verifyUrl)}>
              <ScanLine className="h-4 w-4 mr-2" /> Public View
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
