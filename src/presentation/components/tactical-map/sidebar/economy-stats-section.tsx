import React from "react";
import { Coins } from "lucide-react";

interface EconomyStatsSectionProps {
  gdp: number;
  treasury: number;
  taxRate: number;
  nationalDebt: number;
  tariffRate: number;
}

export function EconomyStatsSection({
  gdp,
  treasury,
  taxRate,
  nationalDebt,
  tariffRate,
}: EconomyStatsSectionProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 px-1">
        <Coins size={13} className="text-gdp" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
          وضعیت اقتصادی و مالی
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 font-mono">
        <div className="bg-background/40 border border-border/60 p-3 rounded-xl space-y-1">
          <span className="text-[9px] text-muted-foreground block">
            تولید ناخالص (GDP)
          </span>
          <span className="text-xs font-bold text-foreground block">
            ${(gdp / 1e9).toFixed(1)} میلیارد
          </span>
        </div>
        <div className="bg-background/40 border border-border/60 p-3 rounded-xl space-y-1">
          <span className="text-[9px] text-muted-foreground block">
            موجودی خزانه
          </span>
          <span className="text-xs font-bold text-gdp block">
            ${treasury.toLocaleString()}
          </span>
        </div>
        <div className="bg-background/40 border border-border/60 p-3 rounded-xl space-y-1">
          <span className="text-[9px] text-muted-foreground block">
            نرخ مالیات / تعرفه
          </span>
          <span className="text-xs font-bold text-foreground block">
            {taxRate}% / {tariffRate}%
          </span>
        </div>
        <div className="bg-background/40 border border-border/60 p-3 rounded-xl space-y-1">
          <span className="text-[9px] text-muted-foreground block">
            بدهی ملی
          </span>
          <span className="text-xs font-bold text-military block">
            ${nationalDebt.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
