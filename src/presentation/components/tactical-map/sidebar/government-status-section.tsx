import React from "react";
import { Landmark } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { Nation } from "@/domain/nation/nation.schema";
import { StabilityCalculator } from "@/engine/politics/stability-calculator";

function GovernmentMetricBar({
  label,
  value,
  deltaText,
  colorClass,
  bgClass,
}: {
  label: string;
  value: number;
  deltaText?: string;
  colorClass: string;
  bgClass: string;
}) {
  return (
    <div className="bg-background/50 border border-border/70 p-3.5 rounded-2xl space-y-2 dir-rtl text-right">
      <div className="flex justify-between items-center text-[10px]">
        <span className="text-muted-foreground font-sans font-bold">
          {label}
        </span>
        <div className="flex items-center gap-1.5 font-mono">
          {deltaText && (
            <span className="text-[9px] text-muted-foreground font-sans bg-secondary/80 px-2 py-0.5 rounded-lg border border-border/40">
              {deltaText}
            </span>
          )}
          <span className={`font-bold ${colorClass}`}>
            {PersianNumberFormatter.toPersianDigits(value)}٪
          </span>
        </div>
      </div>
      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden border border-border/40">
        <div
          className={`${bgClass} h-full rounded-full transition-all duration-300`}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}

interface GovernmentStatusSectionProps {
  stability: number;
  reputation: number;
  nation?: Nation | null;
}

export function GovernmentStatusSection({
  stability,
  reputation,
  nation,
}: GovernmentStatusSectionProps) {
  const stabilityDelta = nation
    ? StabilityCalculator.calculateTurnStabilityDelta(nation)
    : 0;

  const stabilityDeltaText =
    stabilityDelta >= 0
      ? `+${PersianNumberFormatter.toPersianDigits(stabilityDelta)}٪ / نوبت`
      : `${PersianNumberFormatter.toPersianDigits(stabilityDelta)}٪ / نوبت`;

  return (
    <div className="space-y-3 dir-rtl text-right">
      <div className="flex items-center gap-2 px-1">
        <Landmark size={14} className="text-diplomacy" />
        <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider font-mono">
          وضعیت حکومت و پایداری داخلی
        </span>
      </div>

      <div className="space-y-2.5 font-mono text-xs">
        <GovernmentMetricBar
          label="ثبات سیاسی داخلی"
          value={stability}
          deltaText={stabilityDeltaText}
          colorClass={stabilityDelta >= 0 ? "text-gdp" : "text-military"}
          bgClass={stabilityDelta >= 0 ? "bg-gdp" : "bg-military"}
        />

        <div className="bg-background/50 border border-border/70 p-3.5 rounded-2xl flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground font-sans font-bold">
            اعتبار و پرستیژ جهانی
          </span>
          <span
            className={`text-xs font-bold font-mono px-3 py-1 rounded-xl border ${
              reputation < 0
                ? "bg-military/10 border-military/30 text-military"
                : reputation > 0
                  ? "bg-gdp/10 border-gdp/30 text-gdp"
                  : "bg-secondary border-border text-foreground"
            }`}
          >
            {reputation > 0 ? "+" : ""}
            {PersianNumberFormatter.toPersianDigits(reputation)} امتیاز
          </span>
        </div>
      </div>
    </div>
  );
}
