import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { api } from "@/lib/api-client";
import {
  Scale,
  CheckCircle2,
  AlertTriangle,
  Award,
  TrendingUp,
  Brain,
  MapPin,
} from "lucide-react";
import StatCard from "@/components/StatCard";
const DistrictComplianceMap = dynamic(() => import("@/components/maps/DistrictComplianceMap"), { ssr: false });
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function Analytics() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.entities.Instrument.list(),
      api.entities.Application.list(),
      api.entities.Certificate.list(),
      api.entities.Complaint.list(),
      api.entities.Inspection.list(),
    ])
      .then(
        ([
          instruments,
          applications,
          certificates,
          complaints,
          inspections,
        ]) => {
          setData({
            instruments,
            applications,
            certificates,
            complaints,
            inspections,
          });
          setLoading(false);
        },
      )
      .catch(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="text-center py-16 text-sm text-muted-foreground">
        Loading analytics…
      </div>
    );

  const {
    instruments = [],
    applications = [],
    certificates = [],
    complaints = [],
    inspections = [],
  } = data;

  // Instrument status distribution
  const statusData = [
    "registered",
    "pending_verification",
    "verified",
    "expired",
  ]
    .map((s) => ({
      name: s.replace(/_/g, " "),
      value: instruments.filter((i) => i.status === s).length,
    }))
    .filter((d) => d.value > 0);

  // Applications by type
  const appTypeData = ["new_verification", "renewal", "re_inspection"].map(
    (t) => ({
      name: t.replace(/_/g, " "),
      count: applications.filter((a) => a.application_type === t).length,
    }),
  );

  // Complaints by type
  const complaintData = [
    "incorrect_reading",
    "fake_certificate",
    "expired_instrument",
    "tampered_instrument",
    "no_certificate",
  ].map((t) => ({
    name: t.replace(/_/g, " "),
    count: complaints.filter((c) => c.complaint_type === t).length,
  }));

  // AEVE confidence distribution
  const aeveData = inspections
    .filter((i) => i.aeve_status === "complete")
    .map((i) => ({
      name: i.instrument_id?.slice(-6),
      confidence: i.aeve_confidence,
    }));

  // Instruments by district
  const districtData = Object.entries(
    instruments.reduce((acc, i) => {
      const d = i.district || "Unknown";
      acc[d] = (acc[d] || 0) + 1;
      return acc;
    }, {}),
  )
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const verified = instruments.filter((i) => i.status === "verified").length;
  const complianceRate = instruments.length
    ? Math.round((verified / instruments.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Admin Analytics
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Compliance trends, verification coverage and risk overview
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Total Instruments"
          value={instruments.length}
          icon={Scale}
          tone="primary"
        />
        <StatCard
          label="Compliance Rate"
          value={`${complianceRate}%`}
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          label="Certificates"
          value={certificates.length}
          icon={Award}
          tone="violet"
        />
        <StatCard
          label="Open Complaints"
          value={
            complaints.filter(
              (c) => !["resolved", "rejected"].includes(c.status),
            ).length
          }
          icon={AlertTriangle}
          tone="danger"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Instrument Status Distribution">
          {statusData.length === 0 ? (
            <Empty />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  paddingAngle={3}
                >
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Applications by Type">
          {appTypeData.every((d) => d.count === 0) ? (
            <Empty />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={appTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Complaints by Category">
          {complaintData.every((d) => d.count === 0) ? (
            <Empty />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={complaintData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11 }}
                  allowDecimals={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 10 }}
                  width={100}
                />
                <Tooltip />
                <Bar dataKey="count" fill="#ef4444" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="AEVE Confidence Scores" icon={Brain}>
          {aeveData.length === 0 ? (
            <Empty text="No AEVE analyses yet" />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={aeveData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="confidence"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <ChartCard title="District Compliance Map (GIS)" icon={MapPin}>
        <DistrictComplianceMap instruments={instruments} />
      </ChartCard>

      <ChartCard title="Instruments by District" icon={MapPin}>
        {districtData.length === 0 ? (
          <Empty />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={districtData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
}

function ChartCard({ title, icon: Icon, children }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon className="h-4 w-4 text-primary" />}
        <h2 className="font-semibold text-sm">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Empty({ text = "No data available" }) {
  return (
    <div className="flex items-center justify-center h-[250px] text-sm text-muted-foreground">
      {text}
    </div>
  );
}
