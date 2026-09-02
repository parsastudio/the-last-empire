import React, { useMemo } from "react";
import { Landmark } from "lucide-react";
import {
  PersianNumberFormatter,
  StabilityBracketUtility,
} from "@geopolitics/domain";

interface StabilityMeterBadgeProps {
  stability: number;
}

export function StabilityMeterBadge({ stability }: StabilityMeterBadgeProps) {
  const bracket = useMemo(
    () => StabilityBracketUtility.getBracket(stability),
    [stability],
  );

  return (
    <div
      className="flex items-center gap-2 bg-secondary/60 border border-border/80 px-3.5 py-1.5 rounded-2xl font-mono text-xs transition-all hover:bg-secondary cursor-default shrink-0 shadow-sm"
      title={`ثبات سیاسی: ${PersianNumberFormatter.toPersianDigits(stability)}% (${bracket.labelFa} • ${bracket.rateTextFa})`}
    >
      <Landmark size={14} className="text-diplomacy shrink-0" />
      <div className="flex items-center gap-2">
        <span className={`font-bold ${bracket.textColorClass}`}>
          {PersianNumberFormatter.toPersianDigits(stability)}%
        </span>
        <div className="w-12 h-1.5 bg-background/90 rounded-full overflow-hidden border border-border/60">
          <div
            className="h-full rounded-full transition-all duration-300 bg-gdp"
            style={{ width: `${Math.min(100, Math.max(0, stability))}%` }}
          />
        </div>
      </div>
    </div>
  );
}
