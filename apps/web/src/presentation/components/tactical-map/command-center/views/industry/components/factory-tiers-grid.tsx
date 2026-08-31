import React from "react";
import { Layers, Factory } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { FactoryBatch } from "@geopolitics/domain";
import { FactoryTierCard } from "./factory-tier-card";
import { useFactoryTierProcurement } from "../hooks/use-factory-tier-procurement";

interface FactoryTiersGridProps {
  nationId: string;
  treasury: number;
  batches?: FactoryBatch[];
  totalFactories: number;
  maxDomesticTech: number;
}

export function FactoryTiersGrid({
  nationId,
  treasury,
  batches,
  totalFactories,
  maxDomesticTech,
}: FactoryTiersGridProps) {
  const { tierUpgradeItems, feedbacks, isSubmitting, handleUpgradeTier } =
    useFactoryTierProcurement({
      nationId,
      treasury,
      batches,
      maxDomesticTech,
      totalFactories,
    });

  return (
    <div className="space-y-3.5 dir-rtl text-right font-sans">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-gdp/15 border border-gdp/30 text-gdp">
            <Layers size={15} />
          </div>
          <div>
            <h3 className="text-xs font-black text-foreground">
              ناوگان کارخانجات و خطوط تولید کشور
            </h3>
            <span className="text-[10px] text-muted-foreground">
              پایش تفکیکی رده‌های صنعتی و ارتقای فوری سوله‌ها به آخرین سطح دانش
              بومی
            </span>
          </div>
        </div>

        <span className="text-[11px] font-mono bg-secondary/80 border border-border/80 px-3 py-1 rounded-xl font-bold text-muted-foreground flex items-center gap-1.5 shadow-sm">
          <Factory size={12} className="text-gdp" />
          <span>
            {PersianNumberFormatter.toPersianDigits(tierUpgradeItems.length)}{" "}
            رده فعال
          </span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4.5">
        {tierUpgradeItems.map((item) => (
          <FactoryTierCard
            key={`${item.batch.techLevel}-${item.rankIndex}`}
            item={item}
            totalFactories={totalFactories}
            feedbacks={feedbacks[item.rankIndex]}
            isSubmitting={isSubmitting}
            onUpgrade={handleUpgradeTier}
          />
        ))}
      </div>
    </div>
  );
}
