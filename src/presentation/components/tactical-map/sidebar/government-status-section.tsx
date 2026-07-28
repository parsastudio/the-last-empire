import React from "react";
import { Landmark } from "lucide-react";
import { GovernmentMetricBar } from "./government-metric-bar";

interface GovernmentStatusSectionProps {
  stability: number;
  corruption: number;
  warExhaustion: number;
  reputation: number;
  globalAggression: number;
  socialFreedom: number;
}

export function GovernmentStatusSection({
  stability,
  corruption,
  warExhaustion,
  reputation,
  globalAggression,
  socialFreedom,
}: GovernmentStatusSectionProps) {
  return (
    <div className="space-y-2.5">
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

        <GovernmentMetricBar
          label="شاخص آزادی اجتماعی"
          value={socialFreedom}
          colorClass="text-primary"
          bgClass="bg-primary"
        />

        <GovernmentMetricBar
          label="فرسایش جنگی"
          value={warExhaustion}
          colorClass="text-treasury"
          bgClass="bg-treasury"
        />

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-background/40 border border-border/60 p-3 rounded-xl flex flex-col gap-1">
            <span className="text-[9px] text-muted-foreground">
              اعتبار جهانی
            </span>
            <span className="text-xs font-bold text-foreground">
              {reputation} امتیاز
            </span>
          </div>
          <div className="bg-background/40 border border-border/60 p-3 rounded-xl flex flex-col gap-1">
            <span className="text-[9px] text-muted-foreground">
              پرخاشگری جهانی
            </span>
            <span className="text-xs font-bold text-military">
              {globalAggression}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
