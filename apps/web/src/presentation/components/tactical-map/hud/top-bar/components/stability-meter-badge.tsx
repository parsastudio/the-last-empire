import React, { useMemo } from "react";
import { Landmark } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface StabilityMeterBadgeProps {
  stability: number;
}

export function StabilityMeterBadge({ stability }: StabilityMeterBadgeProps) {
  const style = useMemo(() => {
    if (stability >= 70) return { text: "text-gdp", bg: "bg-gdp" };
    if (stability >= 40) return { text: "text-treasury", bg: "bg-treasury" };
    return { text: "text-military", bg: "bg-military" };
  }, [stability]);

  return (
    <div
      className="flex items-center gap-2 bg-secondary/60 border border-border/80 px-3.5 py-1.5 rounded-2xl font-mono text-xs transition-all hover:bg-secondary cursor-default shrink-0 shadow-sm"
      title={`ثبات سیاسی: ${PersianNumberFormatter.toPersianDigits(stability)}%`}
    >
      <Landmark size={14} className="text-diplomacy shrink-0" />
      <div className="flex items-center gap-2">
        <span className={`font-bold ${style.text}`}>
          {PersianNumberFormatter.toPersianDigits(stability)}%
        </span>
        <div className="w-12 h-1.5 bg-background/90 rounded-full overflow-hidden border border-border/60">
          <div
            className={`h-full rounded-full transition-all duration-300 ${style.bg}`}
            style={{ width: `${stability}%` }}
          />
        </div>
      </div>
    </div>
  );
}
