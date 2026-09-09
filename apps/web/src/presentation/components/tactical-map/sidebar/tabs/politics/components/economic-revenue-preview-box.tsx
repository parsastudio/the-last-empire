import React from "react";
import { Building2, Globe2 } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import {
  ECONOMIC_DOCTRINE_CONFIGS,
  EconomicDoctrineStance,
  FiscalRevenueBreakdown,
} from "@geopolitics/domain";

interface EconomicRevenuePreviewBoxProps {
  preview: FiscalRevenueBreakdown;
  activeConfig: (typeof ECONOMIC_DOCTRINE_CONFIGS)[EconomicDoctrineStance];
  gdpPercentage?: number;
}

export function EconomicRevenuePreviewBox({
  preview,
  activeConfig,
  gdpPercentage = 0,
}: EconomicRevenuePreviewBoxProps) {
  return (
    <div className="bg-secondary/50 border border-border/70 p-3.5 rounded-2xl space-y-2.5 font-mono text-xs shadow-inner">
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <span className="text-muted-foreground font-sans font-bold text-[11px]">
          پیش‌بینی درآمد کل هر نوبت:
        </span>
        <div className="flex items-center gap-2">
          {gdpPercentage > 0 && (
            <span className="text-[10px] font-mono font-bold bg-gdp/15 text-gdp border border-gdp/30 px-2 py-0.5 rounded-lg shadow-sm">
              {PersianNumberFormatter.toPersianDigits(gdpPercentage.toFixed(2))}
              ٪ GDP
            </span>
          )}
          <span className="text-sm font-black text-gdp font-mono">
            +{PersianNumberFormatter.formatCurrency(preview.totalRevenue)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <div className="bg-background/70 p-2.5 rounded-xl space-y-1 border border-border/50">
          <div className="flex items-center justify-between text-muted-foreground font-sans">
            <span className="flex items-center gap-1">
              <Building2 size={11} className="text-primary" />
              <span>مالیات و تولید بومی (۸٪ GDP):</span>
            </span>
            <span className="font-bold text-foreground">
              {Math.round(activeConfig.domesticWeight * 100)}٪
            </span>
          </div>
          <span className="font-extrabold text-foreground text-xs block">
            {PersianNumberFormatter.formatCurrency(
              preview.domesticRevenue,
              true,
            )}
          </span>
        </div>

        <div className="bg-background/70 p-2.5 rounded-xl space-y-1 border border-border/50">
          <div className="flex items-center justify-between text-muted-foreground font-sans">
            <span className="flex items-center gap-1">
              <Globe2 size={11} className="text-treasury" />
              <span>شاهراه و صادرات جهانی:</span>
            </span>
            <span className="font-bold text-foreground">
              {Math.round(activeConfig.globalWeight * 100)}٪
            </span>
          </div>
          <span className="font-extrabold text-gdp text-xs block">
            {PersianNumberFormatter.formatCurrency(preview.globalRevenue, true)}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-border/30 text-[10px] text-muted-foreground font-sans">
        <span className="text-muted-foreground">وضعیت شبکه بین‌الملل:</span>
        <div className="flex items-center gap-1">
          <span>شرکای صلح:</span>
          <span className="font-bold text-foreground font-mono">
            {PersianNumberFormatter.toPersianDigits(
              preview.activePeacePartnersCount,
            )}{" "}
            کشور
          </span>
        </div>
      </div>
    </div>
  );
}
