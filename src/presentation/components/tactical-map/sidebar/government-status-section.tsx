import React from "react";
import { Landmark } from "lucide-react";
import { GovernmentMetricBar } from "./government-metric-bar";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface GovernmentStatusSectionProps {
  stability: number;
  corruption: number;
  reputation: number;
}

export function GovernmentStatusSection({
  stability,
  corruption,
  reputation,
}: GovernmentStatusSectionProps) {
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
          colorClass="text-gdp"
          bgClass="bg-gdp"
        />

        <GovernmentMetricBar
          label="شاخص فساد اداری"
          value={corruption}
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
