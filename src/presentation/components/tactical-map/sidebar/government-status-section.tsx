import React from "react";
import { Landmark } from "lucide-react";

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
        <div className="bg-background/40 border border-border/60 p-3 rounded-xl space-y-1.5">
          <div className="flex justify-between text-[10px]">
            <span className="text-muted-foreground">ثبات سیاسی داخلی</span>
            <span className="font-bold text-gdp">{stability}%</span>
          </div>
          <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gdp h-full rounded-full transition-all"
              style={{ width: `${stability}%` }}
            />
          </div>
        </div>

        <div className="bg-background/40 border border-border/60 p-3 rounded-xl space-y-1.5">
          <div className="flex justify-between text-[10px]">
            <span className="text-muted-foreground">شاخص آزادی اجتماعی</span>
            <span className="font-bold text-primary">{socialFreedom}%</span>
          </div>
          <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all"
              style={{ width: `${socialFreedom}%` }}
            />
          </div>
        </div>

        <div className="bg-background/40 border border-border/60 p-3 rounded-xl space-y-1.5">
          <div className="flex justify-between text-[10px]">
            <span className="text-muted-foreground">فرسایش جنگی</span>
            <span className="font-bold text-treasury">{warExhaustion}%</span>
          </div>
          <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-treasury h-full rounded-full transition-all"
              style={{ width: `${warExhaustion}%` }}
            />
          </div>
        </div>

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
