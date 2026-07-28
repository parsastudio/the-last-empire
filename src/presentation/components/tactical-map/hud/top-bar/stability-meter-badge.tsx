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
  const getStabilityColor = (val: number) => {
    if (val >= 70) return "text-gdp bg-gdp";
    if (val >= 40) return "text-treasury bg-treasury";
    return "text-military bg-military";
  };

  const colorClass = getStabilityColor(stability);

  return (
    <div
      className="flex items-center gap-2 bg-secondary/40 border border-border/60 px-3 py-1.5 rounded-2xl font-mono text-xs transition-colors hover:bg-secondary/60 cursor-default shrink-0"
      title={`ثبات سیاسی: ${stability}% | فساد اداری: ${corruption}%`}
    >
      <Landmark size={14} className="text-diplomacy shrink-0" />
      <div className="flex items-center gap-2">
        <span className="font-bold text-foreground">{stability}%</span>
        <div className="w-12 h-1.5 bg-background/80 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${colorClass.split(" ")[1]}`}
            style={{ width: `${stability}%` }}
          />
        </div>
      </div>
    </div>
  );
}
