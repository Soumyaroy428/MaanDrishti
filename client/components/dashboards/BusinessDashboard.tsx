import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api, EntityRecord } from "@/lib/api-client";
import {
  Scale,
  FileText,
  Award,
  MessageSquareWarning,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";

export default function AdminDashboard() {
  const [data, setData] = useState<{
    instruments: EntityRecord[];
    applications: EntityRecord[];
    certificates: EntityRecord[];
    complaints: EntityRecord[];
  }>({ instruments: [], applications: [], certificates: [], complaints: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.entities.Instrument.list(),
      api.entities.Application.list(),
      api.entities.Certificate.list(),
      api.entities.Complaint.list(),
    ])
      .then(([instruments, applications, certificates, complaints]) => {
        setData({ instruments, applications, certificates, complaints });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const {
    instruments = [],
    applications = [],
    certificates = [],
    complaints = [],
  } = data;
  const pendingReview = applications.filter((a) =>
    ["submitted", "document_review", "government_review"].includes(a.status),
  ).length;
  const verified = instruments.filter((i) => i.status === "verified").length;
  const openComplaints = complaints.filter(
    (c) => !["resolved", "rejected"].includes(c.status),
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Government Admin Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Compliance oversight, approvals and analytics
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Total Instruments"
          value={loading ? "—" : instruments.length}
          icon={Scale}
          tone="primary"
        />
        <StatCard
          label="Pending Review"
          value={loading ? "—" : pendingReview}
          icon={Clock}
          tone="warning"
        />
        <StatCard
          label="Certificates Issued"
          value={loading ? "—" : certificates.length}
          icon={Award}
          tone="success"
        />
        <StatCard
          label="Open Complaints"
          value={loading ? "—" : openComplaints}
          icon={MessageSquareWarning}
          tone="danger"
        />
      </div>

      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/applications"
          className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <FileText className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Review Applications</p>
            <p className="text-xs text-muted-foreground">
              Assign inspectors & approve
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
        </Link>
        <Link
          to="/analytics"
          className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Analytics</p>
            <p className="text-xs text-muted-foreground">
              Compliance trends & GIS
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
        </Link>
        <Link
          to="/complaints"
          className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <MessageSquareWarning className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Handle Complaints</p>
            <p className="text-xs text-muted-foreground">
              Citizen reports & resolution
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-4 sm:px-5 py-4">
          <h2 className="font-semibold">Applications Awaiting Action</h2>
          <Link
            to="/applications"
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
          ) : applications.filter(
              (a) => !["approved", "rejected"].includes(a.status),
            ).length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">
              No pending applications
            </div>
          ) : (
            applications
              .filter((a) => !["approved", "rejected"].includes(a.status))
              .slice(0, 6)
              .map((app) => (
                <Link
                  key={app.id}
                  to="/applications"
                  className="flex items-center justify-between px-4 sm:px-5 py-3.5 hover:bg-accent/50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {app.applicant_name} —{" "}
                      {app.application_type?.replace(/_/g, " ")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Instrument: {app.instrument_id}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={app.priority} />
                    <StatusBadge status={app.status} />
                  </div>
                </Link>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
