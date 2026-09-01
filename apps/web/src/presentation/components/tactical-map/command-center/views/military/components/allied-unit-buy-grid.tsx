import React from "react";
import { ArrowRight, Wallet, Award, TrendingUp, Info } from "lucide-react";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { useAlliedArmsProcurement } from "@/presentation/components/tactical-map/command-center/views/military/hooks/use-allied-arms-procurement";
import { AlliedUnitBuyCard } from "@/presentation/components/tactical-map/command-center/views/military/components/allied-unit-buy-card";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";

interface AlliedUnitBuyGridProps {
  buyerNation: Nation;
  sellerNation: Nation;
  provincesMap?: Record<string, Province>;
  currentGdp?: number;
  onBack: () => void;
}

export function AlliedUnitBuyGrid({
  buyerNation,
  sellerNation,
  provincesMap,
  currentGdp,
  onBack,
}: AlliedUnitBuyGridProps) {
  const {
    batchList,
    techMultiplier,
    techDelta,
    floatingFeedbacks,
    handleBuyAlliedBatch,
  } = useAlliedArmsProcurement({
    buyerNation,
    sellerNation,
    provincesMap,
    currentGdp,
  });

  const sellerFlag = getFlagEmoji(sellerNation.flagCode || sellerNation.id);
  const surchargeRate = Math.round((techMultiplier - 1.0) * 100);

  return (
    <div className="space-y-4 font-sans dir-rtl text-right animate-fade-smooth">
      <div className="flex items-center justify-between bg-secondary/40 border border-border/70 p-3.5 rounded-2xl flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 bg-secondary hover:bg-secondary/80 border border-border/70 rounded-xl text-foreground text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
          >
            <ArrowRight size={14} />
            <span>فهرست هم‌پیمانان</span>
          </button>
          <div className="flex items-center gap-2.5">
            <span className="text-2xl select-none">{sellerFlag}</span>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black text-foreground">
                واردات تسلیحاتی از {sellerNation.name}
              </h4>
              <span className="text-[10px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                <Award size={11} />
                <span>
                  سطح فناوری دفاعی: لِوِل{" "}
                  {PersianNumberFormatter.toPersianDigits(
                    sellerNation.military.techLevel.toFixed(1),
                  )}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] bg-secondary/80 border border-border/60 px-3 py-1.5 rounded-xl">
          <Wallet size={13} className="text-primary" />
          <span className="text-muted-foreground font-sans">
            خزانه ملی شما:
          </span>
          <span className="font-extrabold text-gdp text-xs">
            {PersianNumberFormatter.formatCurrency(buyerNation.treasury)}
          </span>
        </div>
      </div>

      <div className="p-3 bg-secondary/30 border border-border/60 rounded-2xl flex items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-2 text-muted-foreground font-sans text-[11px]">
          <Info size={14} className="text-primary shrink-0" />
          <span>
            برتری فناوری دفاعی صادرکننده:{" "}
            <strong className="text-amber-400 font-mono">
              +{PersianNumberFormatter.toPersianDigits(techDelta)}
            </strong>{" "}
            سطح بالاتر (به ازای هر ۰.۱ اختلاف سطح، ۵٪ افزایش قیمت نسبت به نرخ
            پایه اعمال شده است).
          </span>
        </div>

        {surchargeRate > 0 && (
          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20 shrink-0">
            <TrendingUp size={12} />
            <span>
              ضریب تعدیل قیمت:{" "}
              {PersianNumberFormatter.toPersianDigits(techMultiplier)}x
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {batchList.map((item) => (
          <AlliedUnitBuyCard
            key={item.type}
            info={item}
            feedbacks={floatingFeedbacks[item.type]}
            onBuy={handleBuyAlliedBatch}
          />
        ))}
      </div>
    </div>
  );
}
