import React from "react";
import { Zap, Wallet } from "lucide-react";
import { useQuickRecruitBatch } from "@/presentation/components/tactical-map/sidebar/tabs/military/hooks/use-quick-recruit-batch";
import { QuickUnitRecruitCard } from "@/presentation/components/tactical-map/sidebar/tabs/military/components/quick-unit-recruit-card";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface QuickMilitaryRecruitmentGridProps {
  nationId: string;
  treasury?: number;
  techLevel?: number;
  industrialLevel?: number;
}

export function QuickMilitaryRecruitmentGrid({
  nationId,
  treasury = 100000,
  techLevel = 1,
  industrialLevel = 1,
}: QuickMilitaryRecruitmentGridProps) {
  const { batchList, floatingFeedbacks, handleBuyBatch } = useQuickRecruitBatch(
    {
      nationId,
      currentTreasury: treasury,
      techLevel,
      industrialLevel,
    },
  );

  return (
    <div className="space-y-3 font-sans dir-rtl text-right">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <Zap size={15} className="text-gdp animate-pulse" />
          <span className="text-xs font-black text-foreground">
            تجهیز ضربتی ارتش (کلیک سریع با گام ۱۰٪ بودجه)
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] bg-secondary/70 border border-border/60 px-3 py-1.5 rounded-xl">
          <Wallet size={13} className="text-primary" />
          <span className="text-muted-foreground font-sans">
            موجودی خزانه ملی:
          </span>
          <span className="font-extrabold text-gdp text-xs">
            {PersianNumberFormatter.formatCurrency(treasury)}
          </span>
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
