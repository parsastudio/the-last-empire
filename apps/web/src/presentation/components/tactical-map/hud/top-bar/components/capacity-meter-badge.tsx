import React, { useMemo } from "react";
import { Building2 } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface CapacityMeterBadgeProps {
  capacityPct: number;
  population: number;
}

export function CapacityMeterBadge({
  capacityPct,
  population,
}: CapacityMeterBadgeProps) {
  const style = useMemo(() => {
    if (capacityPct > 100) {
      return {
        text: "text-military",
        bg: "bg-military",
      };
    }
    if (capacityPct >= 95) return { text: "text-treasury", bg: "bg-treasury" };
    return { text: "text-gdp", bg: "bg-gdp" };
  }, [capacityPct]);

  const formattedPop = PersianNumberFormatter.formatCompactNumber(population);

  return (
    <div
      className="flex items-center gap-2 bg-secondary/60 border border-border/80 px-3.5 py-1.5 rounded-2xl font-mono text-xs transition-all hover:bg-secondary cursor-default shrink-0 shadow-sm"
      title={`اشغال زیرساخت زیستی: ${PersianNumberFormatter.toPersianDigits(capacityPct)}%`}
    >
      <Building2 size={14} className={`${style.text} shrink-0`} />
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <span className={`font-bold ${style.text}`}>
            {PersianNumberFormatter.toPersianDigits(capacityPct)}%
          </span>
          <span className="text-[10px] text-muted-foreground font-sans">
            ({formattedPop})
          </span>
        </div>
        <div className="w-10 h-1.5 bg-background/90 rounded-full overflow-hidden border border-border/60">
          <div
            className={`h-full rounded-full transition-all duration-300 ${style.bg}`}
            style={{ width: `${Math.min(100, capacityPct)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
