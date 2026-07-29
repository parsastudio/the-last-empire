import React from "react";
import { ShieldAlert } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface ThreatRadarBadgeProps {
  globalAggression: number;
}

export function ThreatRadarBadge({ globalAggression }: ThreatRadarBadgeProps) {
  const isHighThreat = globalAggression >= 50;

  return (
    <div
      className={`flex items-center gap-2 border px-3 py-1.5 rounded-2xl font-mono text-xs transition-colors cursor-default shrink-0 ${
        isHighThreat
          ? "bg-military/15 border-military/40 text-military"
          : "bg-secondary/40 border-border/60 text-muted-foreground"
      }`}
      title="شاخص پرخاشگری جهانی و احتمال تشکیل ائتلاف متخاصم"
    >
      <ShieldAlert
        size={14}
        className={
          isHighThreat ? "animate-pulse text-military" : "text-muted-foreground"
        }
      />
      <div className="flex items-center gap-1 whitespace-nowrap">
        <span className="text-[10px] font-sans font-medium">ائتلاف:</span>
        <span className="font-bold">
          {PersianNumberFormatter.toPersianDigits(globalAggression)}%
        </span>
      </div>
    </div>
  );
}
