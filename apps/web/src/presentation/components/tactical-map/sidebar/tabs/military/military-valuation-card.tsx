import React, { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Coins,
  Receipt,
  Layers,
  TrendingDown,
  ShieldCheck,
} from "lucide-react";
import { MilitaryStack } from "@/domain/military/military.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { selectMilitaryValuationViewModel } from "@/presentation/selectors/military-view-model.selector";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";

interface MilitaryValuationCardProps {
  military: MilitaryStack;
  nationId?: string;
  nation?: Nation;
  provincesMap?: Record<string, Province>;
}

export function MilitaryValuationCard({
  military,
  nationId = "IRN",
  nation,
  provincesMap,
}: MilitaryValuationCardProps) {
  const t = useTranslations("overview.militaryValuation");
  const { formatCurrency, formatNumber, formatPercent } = useLocaleFormatter();

  const metrics = useMemo(
    () =>
      selectMilitaryValuationViewModel(
        military,
        nationId,
        nation,
        provincesMap,
      ),
    [military, nationId, nation, provincesMap],
  );

  return (
    <div className="bg-card/90 border border-border/80 p-4.5 rounded-3xl space-y-3.5 text-start font-sans shadow-xl backdrop-blur-2xl ring-1 ring-white/5 relative overflow-hidden">
      <div className="absolute top-0 start-0 end-0 h-1 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

      <div className="flex items-center justify-between pb-2.5 border-b border-border/60">
        <div className="flex items-center gap-2 font-bold text-xs text-foreground">
          <div className="p-1.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Receipt size={15} />
          </div>
          <span className="font-black">{t("title")}</span>
        </div>
        <span className="text-[10px] font-mono bg-secondary/80 px-2.5 py-1 rounded-xl text-muted-foreground border border-border/60 flex items-center gap-1.5 shadow-sm">
          <Layers size={11} className="text-primary" />
          <span>
            {t("activeUnits", {
              count: formatNumber(metrics.totalUnits),
            })}
          </span>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
        <div className="bg-background/60 border border-border/70 p-3.5 rounded-2xl space-y-1 shadow-inner">
          <span className="text-[10px] text-muted-foreground block font-sans flex items-center gap-1">
            <Coins size={12} className="text-gdp" />
            <span>{t("totalValuation")}</span>
          </span>
          <span className="font-black text-gdp text-sm block truncate">
            {formatCurrency(metrics.totalValuation, true)}
          </span>
          <span className="text-[9px] text-muted-foreground block font-sans">
            {t("capacityRatio", {
              pct: formatPercent(metrics.capacityRatio),
            })}
          </span>
        </div>

        <div className="bg-background/60 border border-border/70 p-3.5 rounded-2xl space-y-1 shadow-inner">
          <span className="text-[10px] text-muted-foreground block font-sans flex items-center gap-1">
            <TrendingDown size={12} className="text-military" />
            <span>{t("turnPayroll")}</span>
          </span>
          <span className="font-black text-military text-sm block truncate">
            -{formatCurrency(metrics.totalPayroll, true)}
          </span>
          {metrics.isGdpCapped && (
            <span className="text-[9px] text-amber-400 font-bold block font-sans flex items-center gap-0.5">
              <ShieldCheck size={10} />
              <span>{t("gdpCapped")}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
