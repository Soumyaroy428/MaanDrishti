import React from "react";
import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  status?: string;
  className?: string;
};

const VARIANTS = {
  verified: "bg-emerald-50 text-emerald-700 border-emerald-200",
  valid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  registered: "bg-blue-50 text-blue-700 border-blue-200",
  submitted: "bg-blue-50 text-blue-700 border-blue-200",
  pending_verification: "bg-amber-50 text-amber-700 border-amber-200",
  document_review: "bg-indigo-50 text-indigo-700 border-indigo-200",
  inspector_assigned: "bg-violet-50 text-violet-700 border-violet-200",
  inspection_scheduled: "bg-violet-50 text-violet-700 border-violet-200",
  inspection_complete: "bg-cyan-50 text-cyan-700 border-cyan-200",
  aeve_analysis: "bg-purple-50 text-purple-700 border-purple-200",
  government_review: "bg-orange-50 text-orange-700 border-orange-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-rose-50 text-rose-700 border-rose-200",
  expired: "bg-rose-50 text-rose-700 border-rose-200",
  revoked: "bg-rose-50 text-rose-700 border-rose-200",
  fail: "bg-rose-50 text-rose-700 border-rose-200",
  review: "bg-amber-50 text-amber-700 border-amber-200",
  potential_failure: "bg-rose-50 text-rose-700 border-rose-200",
  insufficient_evidence: "bg-amber-50 text-amber-700 border-amber-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  complete: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-slate-100 text-slate-600 border-slate-200",
  under_review: "bg-amber-50 text-amber-700 border-amber-200",
  investigating: "bg-orange-50 text-orange-700 border-orange-200",
  resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  low: "bg-slate-100 text-slate-600 border-slate-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  high: "bg-rose-50 text-rose-700 border-rose-200",
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  inactive: "bg-slate-100 text-slate-600 border-slate-200",
};

const LABELS = {
  electronic_weighing_scale: "Weighing Scale",
  weighbridge: "Weighbridge",
  fuel_dispenser: "Fuel Dispenser",
  measuring_cylinder: "Measuring Cylinder",
  retail_weighing_machine: "Retail Scale",
  industrial_equipment: "Industrial Equipment",
  other: "Other",
  new_verification: "New Verification",
  renewal: "Renewal",
  re_inspection: "Re-inspection",
  fake_certificate: "Fake Certificate",
  expired_instrument: "Expired Instrument",
  tampered_instrument: "Tampered Instrument",
  incorrect_reading: "Incorrect Reading",
  no_certificate: "No Certificate",
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant =
    VARIANTS[status as keyof typeof VARIANTS] ||
    "bg-slate-100 text-slate-600 border-slate-200";
  const label =
    LABELS[status as keyof typeof LABELS] ||
    status?.replace(/_/g, " ") ||
    "Unknown";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        variant,
        className,
      )}
    >
      {label}
    </span>
  );
}
