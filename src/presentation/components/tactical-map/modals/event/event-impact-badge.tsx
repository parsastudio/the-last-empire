import React from "react";

interface EventImpactBadgeProps {
  label: string;
  value: string;
  isPositive: boolean;
}

export function EventImpactBadge({
  label,
  value,
  isPositive,
}: EventImpactBadgeProps) {
  return (
    <div
      className={`px-2.5 py-1 rounded-xl border text-[10px] font-mono font-bold flex items-center gap-1 ${
        isPositive
          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
          : "bg-rose-500/10 border-rose-500/30 text-rose-500"
      }`}
    >
      <span>{label}:</span>
      <span>{value}</span>
    </div>
  );
}
