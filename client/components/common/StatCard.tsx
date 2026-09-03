import React from "react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: React.ReactNode;
  value: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "primary" | "success" | "warning" | "danger" | "violet" | "cyan";
  sublabel?: React.ReactNode;
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  tone = "primary",
  sublabel,
}: StatCardProps) {
  const tones = {
    primary: "from-blue-500/10 to-blue-500/5 text-blue-600",
    success: "from-emerald-500/10 to-emerald-500/5 text-emerald-600",
    warning: "from-amber-500/10 to-amber-500/5 text-amber-600",
    danger: "from-rose-500/10 to-rose-500/5 text-rose-600",
    violet: "from-violet-500/10 to-violet-500/5 text-violet-600",
    cyan: "from-cyan-500/10 to-cyan-500/5 text-cyan-600",
  };
  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
            {label}
          </p>
          <p className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {value}
          </p>
          {sublabel && (
            <p className="mt-1 text-xs text-muted-foreground truncate">
              {sublabel}
            </p>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              "flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br",
              tones[tone],
            )}
          >
            <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
        )}
      </div>
    </div>
  );
}
