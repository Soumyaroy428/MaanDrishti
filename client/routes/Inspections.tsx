import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { api } from "@/lib/api-client";
import { Link } from "react-router-dom";
import {
  ClipboardCheck,
  MapPin,
  Calendar,
  ArrowRight,
  Search,
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
const InspectorScheduleMap = dynamic(() => import("@/components/maps/InspectorScheduleMap"), { ssr: false });

export default function Inspections() {
  const [inspections, setInspections] = useState([]);
  const [applications, setApplications] = useState([]);
  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([
      api.entities.Inspection.list("-inspection_date", 100),
      api.entities.Application.list("-submitted_date", 100),
      api.entities.Instrument.list(),
    ]).then(([i, a, inst]) => {
      setInspections(i);
      setApplications(a);
      setInstruments(inst);
      setLoading(false);
    });
  }, []);

  const filtered = inspections.filter(
    (i) =>
      !search ||
      i.instrument_id?.toLowerCase().includes(search.toLowerCase()) ||
      i.inspector_name?.toLowerCase().includes(search.toLowerCase()),
  );

  const queue = applications.filter((a) => a.status === "inspector_assigned");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Inspection Queue
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Assigned inspections and completed records
        </p>
      </div>

      {queue.length > 0 && (
        <div className="rounded-2xl border border-violet-200 bg-violet-50/50 p-4">
          <h2 className="font-semibold text-sm text-violet-900 mb-3">
            Awaiting Inspection ({queue.length})
          </h2>
          <div className="space-y-2">
            {queue.map((app) => {
              const inst = instruments.find(
                (i) => i.instrument_id === app.instrument_id,
              );
              return (
                <Link
                  key={app.id}
                  to={`/inspections/new?appId=${app.id}&instId=${app.instrument_id}`}
                  className="flex items-center justify-between rounded-xl bg-card border border-border p-3 hover:shadow-md transition-all hover:border-primary/30"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {app.instrument_id}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />{" "}
                      {inst?.location || app.applicant_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-medium text-primary">
                      Start Inspection
                    </span>
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-sm">Field Schedule Map</h2>
        </div>
        {loading ? (
          <div className="text-center py-12 text-sm text-muted-foreground">
            Loading map…
          </div>
        ) : (
          <InspectorScheduleMap
            applications={applications}
            instruments={instruments}
          />
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search inspections…"
          className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div>
        <h2 className="font-semibold text-sm text-muted-foreground mb-3">
          Completed Inspections
        </h2>
        {loading ? (
          <div className="text-center py-12 text-sm text-muted-foreground">
            Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardCheck className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">
              No inspections recorded yet
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map((insp) => (
              <Link
                key={insp.id}
                to={`/inspections/${insp.id}`}
                className="block rounded-2xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-all hover:border-primary/30"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-mono text-xs text-muted-foreground">
                        {insp.instrument_id}
                      </p>
                      <StatusBadge status={insp.result} />
                      {insp.conflict_flag && <StatusBadge status="review" />}
                    </div>
                    <p className="mt-1 text-sm font-medium">
                      {insp.inspector_name}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {insp.inspection_date}
                      {insp.location && (
                        <>
                          <MapPin className="h-3 w-3 ml-2" /> {insp.location}
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {insp.aeve_status === "complete" && (
                      <span className="text-xs text-purple-600 font-medium">
                        AEVE: {insp.aeve_confidence}%
                      </span>
                    )}
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
