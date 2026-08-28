import React from "react";
import { Coins, Globe2, Building2, Landmark } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import {
  EconomicDoctrineStance,
  ECONOMIC_DOCTRINE_CONFIGS,
} from "@geopolitics/domain";

interface EconomyStatsSectionProps {
  gdp: number;
  treasury: number;
  nationalDebt: number;
  economicStance?: EconomicDoctrineStance;
}

export function EconomyStatsSection({
  gdp,
  treasury,
  nationalDebt,
  economicStance = "BALANCED_MIXED",
}: EconomyStatsSectionProps) {
  const compactTreasury = PersianNumberFormatter.formatCurrency(treasury, true);
  const formattedGdp = PersianNumberFormatter.formatCurrency(gdp, true);
  const formattedDebt = PersianNumberFormatter.formatCurrency(
    Math.round(nationalDebt),
    true,
  );
  const stanceConfig = ECONOMIC_DOCTRINE_CONFIGS[economicStance];

  return (
    <div className="space-y-3 dir-rtl text-right font-sans">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Coins size={14} className="text-gdp" />
          <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider font-mono">
            شاخص‌های کلان مالی و ارزی
          </span>
        </div>
        <span className="text-[9px] font-mono font-bold bg-primary/10 text-primary border border-primary/30 px-2 py-0.5 rounded-lg">
          {stanceConfig.badgeText}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5 font-mono">
        <div className="bg-background/50 border border-border/70 p-3.5 rounded-2xl space-y-1">
          <span className="text-[9px] text-muted-foreground block font-sans font-bold flex items-center gap-1">
            <Building2 size={11} className="text-primary" />
            تولید ناخالص (GDP)
          </span>
          <span className="text-xs font-extrabold text-foreground block">
            {formattedGdp}
          </span>
        </div>

        <div className="bg-background/50 border border-border/70 p-3.5 rounded-2xl space-y-1">
          <span className="text-[9px] text-muted-foreground block font-sans font-bold flex items-center gap-1">
            <Coins size={11} className="text-gdp" />
            موجودی خزانه ملی
          </span>
          <span className="text-xs font-extrabold text-gdp block truncate">
            {compactTreasury}
          </span>
        </div>

        <div className="bg-background/50 border border-border/70 p-3.5 rounded-2xl space-y-1">
          <span className="text-[9px] text-muted-foreground block font-sans font-bold flex items-center gap-1">
            <Globe2 size={11} className="text-treasury" />
            دکترین مالی حاکم
          </span>
          <span className="text-xs font-extrabold text-foreground block font-sans truncate">
            {stanceConfig.nameFa}
          </span>
        </div>

        <div className="bg-background/50 border border-border/70 p-3.5 rounded-2xl space-y-1">
          <span className="text-[9px] text-muted-foreground block font-sans font-bold flex items-center gap-1">
            <Landmark size={11} className="text-military" />
            بدهی به بانک جهانی
          </span>
          <span className="text-xs font-extrabold text-military block">
            {formattedDebt}
          </span>
        </div>
      </div>
    </div>
  );
}
