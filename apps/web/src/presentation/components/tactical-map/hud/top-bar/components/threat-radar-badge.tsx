import React from "react";
import { ShieldAlert, Globe } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface ThreatRadarBadgeProps {
  globalReputation: number;
}

export function ThreatRadarBadge({ globalReputation }: ThreatRadarBadgeProps) {
  const isHighThreat = globalReputation <= -30;
  const isPositive = globalReputation > 0;

  return (
    <div
      className={`flex items-center gap-2 border px-3.5 py-1.5 rounded-2xl font-mono text-xs transition-all cursor-default shrink-0 shadow-sm ${
        isHighThreat
          ? "bg-military/15 border-military/50 text-military"
          : isPositive
            ? "bg-gdp/15 border-gdp/50 text-gdp"
            : "bg-secondary/60 border-border/80 text-muted-foreground"
      }`}
      title="شاخص پرستیژ و جایگاه بین‌المللی کشور"
    >
      {isHighThreat ? (
        <ShieldAlert size={14} className="animate-pulse text-military" />
      ) : (
        <Globe
          size={14}
          className={isPositive ? "text-gdp" : "text-muted-foreground"}
        />
      )}
      <div className="flex items-center gap-1 whitespace-nowrap">
        <span className="text-[10px] font-sans font-medium">
          {isHighThreat ? "خطر ائتلاف:" : "اعتبار:"}
        </span>
        <span className="font-bold">
          {globalReputation > 0 ? "+" : ""}
          {PersianNumberFormatter.toPersianDigits(globalReputation)}
        </span>
      </div>
    </div>
  );
}
