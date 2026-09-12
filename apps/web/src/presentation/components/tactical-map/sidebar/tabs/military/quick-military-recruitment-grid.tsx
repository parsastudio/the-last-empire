import React from "react";
import { useTranslations } from "next-intl";
import { Zap, Wallet, ShieldAlert } from "lucide-react";
import { useQuickRecruitBatch } from "@/presentation/components/tactical-map/sidebar/tabs/military/hooks/use-quick-recruit-batch";
import { QuickUnitRecruitCard } from "@/presentation/components/tactical-map/sidebar/tabs/military/components/quick-unit-recruit-card";
import { NavalFleetProcurementCard } from "@/presentation/components/tactical-map/sidebar/tabs/military/components/naval-fleet-procurement-card";
import {
  Nation,
  MilitaryPricingCalculator,
  Province,
  NationGettersUtility,
} from "@geopolitics/domain";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";

interface QuickMilitaryRecruitmentGridProps {
  nation: Nation;
  currentGdp: number;
  provincesMap?: Record<string, Province>;
}

export function QuickMilitaryRecruitmentGrid({
  nation,
  currentGdp,
  provincesMap,
}: QuickMilitaryRecruitmentGridProps) {
  const t = useTranslations("overview.quickRecruit");
  const { formatCurrency, formatPercent } = useLocaleFormatter();

  const { batchList, floatingFeedbacks, handleBuyBatch } = useQuickRecruitBatch(
    {
      nationId: nation.id,
      nation,
      currentGdp,
    },
  );

  const currentValuation =
    MilitaryPricingCalculator.calculateTotalArmyValuation(nation.military);

  const capacityRatio = MilitaryPricingCalculator.calculateArmyCapacityRatio(
    currentGdp,
    currentValuation,
  );

  const hasSeaAccess = NationGettersUtility.hasSeaAccess(
    nation.id,
    provincesMap,
  );

  return (
    <div className="space-y-4 font-sans text-start">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <Zap size={15} className="text-gdp animate-pulse" />
          <span className="text-xs font-black text-foreground">
            {t("title")}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-[11px] bg-secondary/70 border border-border/60 px-3 py-1.5 rounded-xl">
            <ShieldAlert size={13} className="text-amber-400" />
            <span className="text-muted-foreground font-sans">
              {t("armyCapOccupancy")}
            </span>
            <span
              className={`font-extrabold text-xs ${
                capacityRatio >= 95 ? "text-military" : "text-gdp"
              }`}
            >
              {formatPercent(capacityRatio)}
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] bg-secondary/70 border border-border/60 px-3 py-1.5 rounded-xl">
            <Wallet size={13} className="text-primary" />
            <span className="text-muted-foreground font-sans">
              {t("nationalTreasury")}
            </span>
            <span className="font-extrabold text-gdp text-xs">
              {formatCurrency(nation.treasury)}
            </span>
          </div>
        </div>
      </div>

      <NavalFleetProcurementCard
        nationId={nation.id}
        treasury={nation.treasury}
        navalFleetCount={nation.navalFleet || 0}
        hasSeaAccess={hasSeaAccess}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {batchList.map((item) => (
          <QuickUnitRecruitCard
            key={item.type}
            info={item}
            feedbacks={floatingFeedbacks[item.type] || []}
            onBuy={handleBuyBatch}
          />
        ))}
      </div>
    </div>
  );
}
