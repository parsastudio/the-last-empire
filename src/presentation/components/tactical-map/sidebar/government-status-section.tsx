import React from "react";
import { Landmark } from "lucide-react";
import { GovernmentMetricBar } from "./government-metric-bar";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { Nation } from "@/domain/nation/nation.schema";
import { StabilityCalculator } from "@/engine/politics/stability-calculator";

interface GovernmentStatusSectionProps {
  stability: number;
  corruption: number;
  reputation: number;
  nation?: Nation | null;
}

export function GovernmentStatusSection({
  stability,
  corruption,
  reputation,
  nation,
}: GovernmentStatusSectionProps) {
  const stabilityCalc = new StabilityCalculator();
  const stabilityDelta = nation
    ? stabilityCalc.calculateTurnStabilityDelta(nation)
    : 0;

  const stabilityDeltaText =
    stabilityDelta >= 0
      ? `+${PersianNumberFormatter.toPersianDigits(stabilityDelta)}٪ / نوبت`
      : `${PersianNumberFormatter.toPersianDigits(stabilityDelta)}٪ / نوبت`;

  const corruptionGrowth = nation
    ? Number(
        (
          5.0 * (1.0 - nation.government.stability / 100) +
          (nation.government.type === "DICTATORSHIP"
            ? 0.5
            : nation.government.type === "FASCISM"
              ? 0.3
              : 0)
        ).toFixed(2),
      )
    : 0;

  const corruptionDeltaText = `+${PersianNumberFormatter.toPersianDigits(corruptionGrowth)}٪ انتروپی / نوبت`;

  return (
    <div className="space-y-2.5 dir-rtl text-right">
      <div className="flex items-center gap-2 px-1">
        <Landmark size={13} className="text-diplomacy" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
          وضعیت حکومت و پایداری داخلی
        </span>
      </div>

      <div className="space-y-2 font-mono text-xs">
        <GovernmentMetricBar
          label="ثبات سیاسی داخلی"
          value={stability}
          deltaText={stabilityDeltaText}
          colorClass={stabilityDelta >= 0 ? "text-gdp" : "text-military"}
          bgClass={stabilityDelta >= 0 ? "bg-gdp" : "bg-military"}
        />

        <GovernmentMetricBar
          label="شاخص فساد اداری"
          value={corruption}
          deltaText={corruptionDeltaText}
          colorClass="text-military"
          bgClass="bg-military"
        />

        <div className="bg-background/40 border border-border/60 p-3 rounded-xl flex flex-col gap-1">
          <span className="text-[9px] text-muted-foreground font-sans">
            اعتبار و پرستیژ جهانی
          </span>
          <span
            className={`text-xs font-bold ${
              reputation < 0
                ? "text-military"
                : reputation > 0
                  ? "text-gdp"
                  : "text-foreground"
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
