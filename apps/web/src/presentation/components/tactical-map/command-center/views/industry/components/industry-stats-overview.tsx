import React from "react";
import { useTranslations } from "next-intl";
import { Factory, TrendingUp, Cpu, Hammer } from "lucide-react";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";

interface IndustryStatsOverviewProps {
  totalActiveFactories: number;
  totalMaxSlots: number;
  nationalIndustrialOccupancy: number;
  totalFactoriesYield: number;
  industrialLevel: number;
  equipmentTechLevel: number;
}

export function IndustryStatsOverview({
  totalActiveFactories,
  totalMaxSlots,
  nationalIndustrialOccupancy,
  totalFactoriesYield,
  industrialLevel,
  equipmentTechLevel,
}: IndustryStatsOverviewProps) {
  const t = useTranslations("industry.overview");
  const { formatNumber, formatPercent, formatCurrency, formatLevel } =
    useLocaleFormatter();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-start font-sans">
      <div className="bg-card/90 border border-border/80 p-4 rounded-3xl space-y-1.5 shadow-sm">
        <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1.5">
          <Factory size={14} className="text-gdp" />
          <span>{t("activeFactories")}</span>
        </span>
        <div className="flex items-baseline justify-between">
          <span className="text-xl font-black font-mono text-foreground">
            {formatNumber(totalActiveFactories)}
            <span className="text-xs text-muted-foreground font-normal ms-1">
              / {formatNumber(totalMaxSlots)}
            </span>
          </span>
          <span className="text-xs font-mono font-bold text-gdp">
            {formatPercent(nationalIndustrialOccupancy)}
          </span>
        </div>
        <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gdp rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(100, nationalIndustrialOccupancy)}%`,
            }}
          />
        </div>
      </div>

      <div className="bg-card/90 border border-border/80 p-4 rounded-3xl space-y-1.5 shadow-sm">
        <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1.5">
          <TrendingUp size={14} className="text-emerald-400" />
          <span>{t("totalFactoriesYield")}</span>
        </span>
        <span className="text-lg font-black font-mono text-emerald-400 block pt-1">
          {formatCurrency(totalFactoriesYield, true)}
        </span>
        <span className="text-[10px] text-muted-foreground font-mono block">
          {t("gdpShareDesc")}
        </span>
      </div>

      <div className="bg-card/90 border border-border/80 p-4 rounded-3xl space-y-1.5 shadow-sm">
        <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1.5">
          <Cpu size={14} className="text-primary" />
          <span>{t("rndKnowledge")}</span>
        </span>
        <span className="text-lg font-black font-mono text-primary block pt-1">
          {formatLevel(industrialLevel)}
        </span>
        <span className="text-[10px] text-muted-foreground font-mono block">
          {t("rndKnowledgeDesc")}
        </span>
      </div>

      <div className="bg-card/90 border border-border/80 p-4 rounded-3xl space-y-1.5 shadow-sm">
        <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1.5">
          <Hammer size={14} className="text-gdp" />
          <span>{t("equipmentTier")}</span>
        </span>
        <span className="text-lg font-black font-mono text-gdp block pt-1">
          {formatLevel(equipmentTechLevel)}
        </span>
        <span className="text-[10px] text-muted-foreground font-mono block">
          {t("equipmentTierDesc")}
        </span>
      </div>
    </div>
  );
}
