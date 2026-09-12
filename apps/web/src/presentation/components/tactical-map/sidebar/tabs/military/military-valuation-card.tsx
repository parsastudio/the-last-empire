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
    <div className="bg-background/40 border border-border/60 p-4 rounded-2xl space-y-3 text-start font-sans">
      <div className="flex items-center justify-between pb-1 border-b border-border/40">
        <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
          <Receipt size={15} className="text-treasury" />
          <span>{t("title")}</span>
        </div>
        <span className="text-[10px] font-mono bg-secondary/80 px-2 py-0.5 rounded-lg text-muted-foreground border border-border/50 flex items-center gap-1">
          <Layers size={11} />
          <span>
            {t("activeUnits", {
              count: formatNumber(metrics.totalUnits),
            })}
          </span>
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5 font-mono text-xs">
        <div className="bg-secondary/40 border border-border/50 p-3 rounded-xl space-y-1">
          <span className="text-[10px] text-muted-foreground block font-sans flex items-center gap-1">
            <Coins size={12} className="text-gdp" />
            {t("totalValuation")}
          </span>
          <span className="font-extrabold text-gdp text-xs block truncate">
            {formatCurrency(metrics.totalValuation, true)}
          </span>
          <span className="text-[9px] text-muted-foreground block font-sans">
            {t("capacityRatio", {
              pct: formatPercent(metrics.capacityRatio),
            })}
          </span>
        </div>

        <div className="bg-secondary/40 border border-border/50 p-3 rounded-xl space-y-1">
          <span className="text-[10px] text-muted-foreground block font-sans flex items-center gap-1">
            <TrendingDown size={12} className="text-military" />
            {t("turnPayroll")}
          </span>
          <span className="font-extrabold text-military text-xs block truncate">
            -{formatCurrency(metrics.totalPayroll, true)}
          </span>
          {metrics.isGdpCapped && (
            <span className="text-[9px] text-amber-400 font-bold block font-sans flex items-center gap-0.5">
              <ShieldCheck size={10} />
              {t("gdpCapped")}
            </span>
          )}
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground leading-relaxed bg-secondary/20 p-2.5 rounded-xl border border-border/40 font-sans">
        {t("valuationInfo")}
      </p>
    </div>
  );
}
