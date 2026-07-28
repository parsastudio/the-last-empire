import React from "react";
import { Landmark } from "lucide-react";

interface StabilityMeterBadgeProps {
  stability: number;
  corruption: number;
}

export function StabilityMeterBadge({
  stability,
  corruption,
}: StabilityMeterBadgeProps) {
  const getStyle = (val: number) => {
    if (val >= 70) return { text: "text-gdp", bg: "bg-gdp" };
    if (val >= 40) return { text: "text-treasury", bg: "bg-treasury" };
    return { text: "text-military", bg: "bg-military" };
  };

  const style = getStyle(stability);

  return (
    <div
      className="flex items-center gap-2 bg-secondary/40 border border-border/60 px-3 py-1.5 rounded-2xl font-mono text-xs transition-colors hover:bg-secondary/60 cursor-default shrink-0"
      title={`ثبات سیاسی: ${stability}% | فساد اداری: ${corruption}%`}
    >
      <Landmark size={14} className="text-diplomacy shrink-0" />
      <div className="flex items-center gap-2">
        <span className={`font-bold ${style.text}`}>{stability}%</span>
        <div className="w-12 h-1.5 bg-background/80 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${style.bg}`}
            style={{ width: `${stability}%` }}
          />
        </div>
      </div>
    </div>
  );
}
