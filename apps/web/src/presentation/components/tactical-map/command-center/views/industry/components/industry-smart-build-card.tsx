import React from "react";
import { useTranslations } from "next-intl";
import {
  Factory,
  Zap,
  Loader2,
  CheckCircle2,
  Building2,
  Coins,
  ShieldCheck,
} from "lucide-react";
import { IndustryCalculator } from "@geopolitics/domain";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";

interface IndustrySmartBuildCardProps {
  totalActiveFactories: number;
  totalMaxSlots: number;
  totalEmptySlots: number;
  batchQuantity: number;
  batchCost: number;
  canAfford: boolean;
  isBuilding: boolean;
  onBuild: () => void;
}

export function IndustrySmartBuildCard({
  totalActiveFactories,
  totalMaxSlots,
  totalEmptySlots,
  batchQuantity,
  batchCost,
  canAfford,
  isBuilding,
  onBuild,
}: IndustrySmartBuildCardProps) {
  const t = useTranslations("industry.smartBuild");
  const { formatCurrency, formatNumber, formatPercent } = useLocaleFormatter();
  const isFull = totalEmptySlots <= 0;
  const occupancyPct =
    totalMaxSlots > 0
      ? Math.round((totalActiveFactories / totalMaxSlots) * 100)
      : 100;

  const unitCostFormatted = formatCurrency(
    IndustryCalculator.FACTORY_REBUILD_COST,
    true,
  );

  return (
    <div className="relative p-4 sm:p-5 rounded-3xl border border-border/80 bg-gradient-to-r from-secondary/70 via-card/95 to-secondary/70 shadow-xl backdrop-blur-2xl space-y-4 font-sans text-start overflow-hidden ring-1 ring-white/5">
      <div className="absolute top-0 start-0 end-0 h-1 bg-gradient-to-r from-transparent via-gdp/50 to-transparent" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gdp/15 border border-gdp/30 flex items-center justify-center text-gdp shrink-0 shadow-inner">
            <Factory size={20} className="animate-pulse" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-xs sm:text-sm font-black text-foreground">
              {t("title")}
            </h3>
            <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
              <Coins size={11} className="text-amber-400" />
              <span>{t("unitCost", { cost: unitCostFormatted })}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <span
            className={`text-[11px] font-bold px-3 py-1 rounded-xl border flex items-center gap-1.5 shadow-sm ${
              isFull
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                : "bg-gdp/15 text-gdp border-gdp/30"
            }`}
          >
            <ShieldCheck size={13} />
            <span>
              {isFull ? t("capacityFull") : formatPercent(occupancyPct)}
            </span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-background/60 border border-border/70 p-3.5 rounded-2xl flex items-center justify-between font-mono">
          <span className="text-[11px] text-muted-foreground font-sans font-bold flex items-center gap-1.5">
            <Building2 size={14} className="text-primary shrink-0" />
            <span>{t("occupancy")}</span>
          </span>
          <span className="text-xs font-black text-foreground">
            {formatNumber(totalActiveFactories)}
            <span className="text-[10px] text-muted-foreground font-normal ms-1">
              {t("ofTotalSlots", { max: formatNumber(totalMaxSlots) })}
            </span>
          </span>
        </div>

        <div className="bg-background/60 border border-border/70 p-3.5 rounded-2xl flex items-center justify-between font-mono">
          <span className="text-[11px] text-muted-foreground font-sans font-bold flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-gdp shrink-0" />
            <span>{t("totalSlotsCompleted")}</span>
          </span>
          <span
            className={`text-xs font-black ${
              isFull ? "text-emerald-400" : "text-gdp"
            }`}
          >
            {formatPercent(occupancyPct)}
          </span>
        </div>
      </div>

      {isFull ? (
        <div className="w-full py-3 px-4 bg-emerald-950/20 text-emerald-400 border border-emerald-500/30 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 select-none shadow-inner font-sans">
          <CheckCircle2 size={15} />
          <span>{t("allProvincesFull")}</span>
        </div>
      ) : (
        <button
          type="button"
          onClick={onBuild}
          disabled={!canAfford || isBuilding}
          className="w-full py-3.5 px-4 bg-gdp hover:bg-gdp/90 disabled:bg-secondary disabled:text-muted-foreground text-primary-foreground rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-gdp/20 hover:scale-[1.005] active:scale-[0.995] border border-gdp/30"
        >
          {isBuilding ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Zap size={15} />
          )}
          <span>
            {!canAfford
              ? t("insufficientFunds")
              : t("buildAction", {
                  count: formatNumber(batchQuantity),
                  cost: formatCurrency(batchCost, true),
                })}
          </span>
        </button>
      )}
    </div>
  );
}
