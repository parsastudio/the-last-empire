import React from "react";
import { useTranslations } from "next-intl";
import { Building2, Globe2 } from "lucide-react";
import {
  ECONOMIC_DOCTRINE_CONFIGS,
  EconomicDoctrineStance,
  FiscalRevenueBreakdown,
} from "@geopolitics/domain";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";

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
  const t = useTranslations("politics");
  const { formatCurrency, formatPercent, toDigits } = useLocaleFormatter();

  return (
    <div className="bg-secondary/50 border border-border/70 p-3.5 rounded-2xl space-y-2.5 font-mono text-xs shadow-inner">
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <span className="text-muted-foreground font-sans font-bold text-[11px]">
          {t("forecastRevenue")}
        </span>
        <div className="flex items-center gap-2">
          {gdpPercentage > 0 && (
            <span className="text-[10px] font-mono font-bold bg-gdp/15 text-gdp border border-gdp/30 px-2 py-0.5 rounded-lg shadow-sm">
              {formatPercent(gdpPercentage, 2)} GDP
            </span>
          )}
          <span className="text-sm font-black text-gdp font-mono">
            +{formatCurrency(preview.totalRevenue)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <div className="bg-background/70 p-2.5 rounded-xl space-y-1 border border-border/50">
          <div className="flex items-center justify-between text-muted-foreground font-sans">
            <span className="flex items-center gap-1">
              <Building2 size={11} className="text-primary" />
              <span>{t("domesticRevenueLabel")}</span>
            </span>
            <span className="font-bold text-foreground">
              {formatPercent(Math.round(activeConfig.domesticWeight * 100))}
            </span>
          </div>
          <span className="font-extrabold text-foreground text-xs block">
            {formatCurrency(preview.domesticRevenue, true)}
          </span>
        </div>

        <div className="bg-background/70 p-2.5 rounded-xl space-y-1 border border-border/50">
          <div className="flex items-center justify-between text-muted-foreground font-sans">
            <span className="flex items-center gap-1">
              <Globe2 size={11} className="text-treasury" />
              <span>{t("globalRevenueLabel")}</span>
            </span>
            <span className="font-bold text-foreground">
              {formatPercent(Math.round(activeConfig.globalWeight * 100))}
            </span>
          </div>
          <span className="font-extrabold text-gdp text-xs block">
            {formatCurrency(preview.globalRevenue, true)}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-border/30 text-[10px] text-muted-foreground font-sans">
        <span className="text-muted-foreground">{t("networkStatus")}</span>
        <div className="flex items-center gap-1">
          <span className="font-bold text-foreground font-mono">
            {t("peacePartners", {
              count: toDigits(preview.activePeacePartnersCount),
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
