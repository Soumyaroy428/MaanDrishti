import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api-client";
import {
  ClipboardCheck,
  Clock,
  AlertTriangle,
  MapPin,
  ScanLine,
  Video,
  ArrowRight,
} from "lucide-react";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";

export default function InspectorDashboard() {
  const [inspections, setInspections] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.entities.Inspection.list("-inspection_date", 20),
      api.entities.Application.filter(
        { status: "inspector_assigned" },
        "-submitted_date",
        20,
      ),
    ])
      .then(([i, a]) => {
        setInspections(i);
        setApplications(a);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const today = inspections.filter(
    (i) => i.inspection_date === new Date().toISOString().slice(0, 10),
  ).length;
  const pending = applications.length;
  const violations = inspections.filter((i) => i.result === "fail").length;
  const review = inspections.filter(
    (i) => i.result === "review" || i.conflict_flag,
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Inspector Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Field inspection queue and evidence capture
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Today's Inspections"
          value={loading ? "—" : today}
          icon={ClipboardCheck}
          tone="primary"
        />
        <StatCard
          label="Pending Queue"
          value={loading ? "—" : pending}
          icon={Clock}
          tone="warning"
        />
        <StatCard
          label="Needs Review"
          value={loading ? "—" : review}
          icon={AlertTriangle}
          tone="violet"
        />
        <StatCard
          label="Violations"
          value={loading ? "—" : violations}
          icon={AlertTriangle}
          tone="danger"
        />
      </div>

      <div className="grid gap-3 sm:gap-4 sm:grid-cols-3">
        <Link
          to="/inspections"
          className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <ClipboardCheck className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Inspection Queue</p>
            <p className="text-xs text-muted-foreground">
              View assigned inspections
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
        </Link>
        <Link
          to="/instruments"
          className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <ScanLine className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Scan QR</p>
            <p className="text-xs text-muted-foreground">
              Verify instrument on-site
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
        </Link>
        <Link
          to="/inspections"
          className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Video className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Video Evidence</p>
            <p className="text-xs text-muted-foreground">
              AEVE-assisted capture
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-4 sm:px-5 py-4">
          <h2 className="font-semibold">Assigned Inspections</h2>
          <Link
            to="/inspections"
            className="text-sm text-primary hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="divide-y divide-border">
          {loading ? (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">
              Loading…
            </div>
          ) : applications.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">
              No pending inspections
            </div>
          ) : (
            applications.slice(0, 6).map((app) => (
              <Link
                key={app.id}
                to="/inspections"
                className="flex items-center justify-between px-4 sm:px-5 py-3.5 hover:bg-accent/50 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {app.instrument_id}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {app.applicant_name}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={app.status} />
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
