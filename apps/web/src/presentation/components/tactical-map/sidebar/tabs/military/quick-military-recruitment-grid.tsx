import React from "react";
import { Zap, Wallet, ShieldAlert } from "lucide-react";
import { useQuickRecruitBatch } from "@/presentation/components/tactical-map/sidebar/tabs/military/hooks/use-quick-recruit-batch";
import { QuickUnitRecruitCard } from "@/presentation/components/tactical-map/sidebar/tabs/military/components/quick-unit-recruit-card";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { Nation, MilitaryPricingCalculator } from "@geopolitics/domain";

interface QuickMilitaryRecruitmentGridProps {
  nation: Nation;
  currentGdp: number;
  hasSeaAccess?: boolean;
}

export function QuickMilitaryRecruitmentGrid({
  nation,
  currentGdp,
  hasSeaAccess = true,
}: QuickMilitaryRecruitmentGridProps) {
  const { batchList, floatingFeedbacks, handleBuyBatch } = useQuickRecruitBatch(
    {
      nationId: nation.id,
      nation,
      currentGdp,
      hasSeaAccess,
    },
  );

  const currentValuation =
    MilitaryPricingCalculator.calculateTotalArmyValuation(nation.military);
  const capacityRatio =
    currentGdp > 0
      ? Math.min(100, Math.round((currentValuation / currentGdp) * 100))
      : 100;

  return (
    <div className="space-y-3 font-sans dir-rtl text-right">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <Zap size={15} className="text-gdp animate-pulse" />
          <span className="text-xs font-black text-foreground">
            تجهیز ضربتی ارتش (سقف ارزش = ۱۰۰٪ GDP)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-[11px] bg-secondary/70 border border-border/60 px-3 py-1.5 rounded-xl">
            <ShieldAlert size={13} className="text-amber-400" />
            <span className="text-muted-foreground font-sans">
              اشغال سقف ارتش:
            </span>
            <span
              className={`font-extrabold text-xs ${
                capacityRatio >= 95 ? "text-military" : "text-gdp"
              }`}
            >
              {PersianNumberFormatter.toPersianDigits(capacityRatio)}٪
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] bg-secondary/70 border border-border/60 px-3 py-1.5 rounded-xl">
            <Wallet size={13} className="text-primary" />
            <span className="text-muted-foreground font-sans">خزانه ملی:</span>
            <span className="font-extrabold text-gdp text-xs">
              {PersianNumberFormatter.formatCurrency(nation.treasury)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {batchList.map((item) => (
          <QuickUnitRecruitCard
            key={item.type}
            info={item}
            feedbacks={floatingFeedbacks[item.type]}
            onBuy={handleBuyBatch}
          />
        ))}
      </div>
    </div>
  );
}
