import React from "react";
import { Factory, Sparkles, Layers } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { FactoryBatch, IndustryCalculator } from "@geopolitics/domain";
import { FactoryTierCard } from "./factory-tier-card";

interface FactoryTiersGridProps {
  batches?: FactoryBatch[];
  totalFactories: number;
  equipmentTechLevel: number;
  maxDomesticTech: number;
}

export function FactoryTiersGrid({
  batches,
  totalFactories,
  equipmentTechLevel,
  maxDomesticTech,
}: FactoryTiersGridProps) {
  const consolidated = React.useMemo(() => {
    if (batches && batches.length > 0) {
      return IndustryCalculator.consolidateBatches(batches);
    }
    return [
      {
        techLevel: equipmentTechLevel,
        count: totalFactories,
      },
    ];
  }, [batches, equipmentTechLevel, totalFactories]);

  return (
    <div className="space-y-3 dir-rtl text-right font-sans">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-gdp" />
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider font-mono">
            تفکیک خطوط تولید بر اساس سطوح فناوری فعال
          </span>
        </div>
        <span className="text-[10px] font-mono bg-secondary/80 border border-border/70 px-2.5 py-0.5 rounded-xl font-bold text-muted-foreground flex items-center gap-1">
          <Factory size={11} className="text-gdp" />
          <span>
            {PersianNumberFormatter.toPersianDigits(consolidated.length)} رده
            صنعتی
          </span>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {consolidated.map((batch, index) => (
          <FactoryTierCard
            key={`${batch.techLevel}-${index}`}
            batch={batch}
            totalFactories={totalFactories}
            maxDomesticTech={maxDomesticTech}
            rankIndex={index}
          />
        ))}
      </div>
    </div>
  );
}
