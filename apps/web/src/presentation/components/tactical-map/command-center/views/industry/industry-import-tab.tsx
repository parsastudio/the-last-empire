"use client";

import React, { useState, useMemo } from "react";
import { ShoppingCart, ShieldCheck } from "lucide-react";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { IndustryCalculator } from "@/domain/economy/industry-calculator.utility";
import { ActionFactory } from "@/domain/game/action-factory";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { MachinerySellerCard } from "./components/machinery-seller-card";
import {
  MachineryTrancheCard,
  MachineryTrancheInfo,
} from "./components/machinery-tranche-card";

interface IndustryImportTabProps {
  nation: Nation;
  nationsMap?: Record<string, Nation>;
  provincesMap?: Record<string, Province>;
}

export function IndustryImportTab({
  nation,
  nationsMap,
  provincesMap,
}: IndustryImportTabProps) {
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { dispatchAction } = useGameActions();

  const totalFactories = useMemo(() => {
    if (!provincesMap) return 10;
    const count = Object.values(provincesMap)
      .filter((p) => p.ownerNationId === nation.id)
      .reduce((sum, p) => sum + p.factoriesCount, 0);
    return Math.max(1, count);
  }, [provincesMap, nation.id]);

  const currentEquipmentTech = nation.equipmentTechLevel;

  const sellers = useMemo(() => {
    if (!nationsMap) return [];
    return Object.values(nationsMap)
      .filter(
        (n) =>
          n.isAlive &&
          n.id !== nation.id &&
          n.industrialLevel > currentEquipmentTech,
      )
      .sort((a, b) => b.industrialLevel - a.industrialLevel);
  }, [nationsMap, nation.id, currentEquipmentTech]);

  const selectedSeller = useMemo(() => {
    return sellers.find((s) => s.id === selectedSellerId) || sellers[0] || null;
  }, [sellers, selectedSellerId]);

  const tranches = useMemo<MachineryTrancheInfo[]>(() => {
    if (!selectedSeller) return [];

    const sellerTech = selectedSeller.industrialLevel;
    const unitCost = IndustryCalculator.calculateModernizeUnitCost(
      currentEquipmentTech,
      sellerTech,
    );

    const baseIncome =
      totalFactories *
      IndustryCalculator.calculateFactoryYield(currentEquipmentTech);

    const isMaxedOut = currentEquipmentTech >= sellerTech;

    const configs = [
      {
        percentage: 0.1,
        percentageLabel: "۱۰٪ کارخانه‌ها",
        badgeTitle: "بسته چابک واردات خطوط",
        calcQty: Math.max(1, Math.round(totalFactories * 0.1)),
      },
      {
        percentage: 0.25,
        percentageLabel: "۲۵٪ کارخانه‌ها",
        badgeTitle: "بسته توسعه استراتژیک",
        calcQty: Math.max(
          1,
          Math.min(totalFactories, Math.round(totalFactories * 0.25)),
        ),
      },
      {
        percentage: 1.0,
        percentageLabel: "۱۰۰٪ کارخانه‌ها",
        badgeTitle: "نوسازی جامع و سراسری",
        calcQty: totalFactories,
      },
    ];

    return configs.map((cfg) => {
      const quantity = cfg.calcQty;
      const totalCost = quantity * unitCost;
      const projectedTech = IndustryCalculator.calculateNewEquipmentTechLevel(
        totalFactories,
        currentEquipmentTech,
        quantity,
        sellerTech,
      );
      const newIncome =
        totalFactories *
        IndustryCalculator.calculateFactoryYield(projectedTech);
      const projectedIncomeDelta = Math.max(0, newIncome - baseIncome);
      const canAfford = nation.treasury >= totalCost && totalCost > 0;

      return {
        percentage: cfg.percentage,
        percentageLabel: cfg.percentageLabel,
        badgeTitle: cfg.badgeTitle,
        quantity,
        totalFactories,
        totalCost,
        currentTech: currentEquipmentTech,
        targetTech: sellerTech,
        projectedTech,
        projectedIncomeDelta,
        canAfford,
        isMaxedOut,
      };
    });
  }, [selectedSeller, totalFactories, currentEquipmentTech, nation.treasury]);

  const handlePurchaseTranche = async (quantity: number) => {
    if (!selectedSeller || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const action = ActionFactory.buyIndustrialEquipment(
        nation.id,
        selectedSeller.id,
        quantity,
      );
      await dispatchAction(
        action,
        `تجهیزات صنعتی برای ${PersianNumberFormatter.formatNumberWithCommas(quantity)} کارخانه از ${selectedSeller.name} خریداری شد.`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 dir-rtl text-right font-sans animate-in fade-in duration-200">
      <div className="bg-card/90 border border-border/80 p-4.5 rounded-3xl space-y-2 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-primary/15 text-primary border border-primary/30">
            <ShoppingCart size={18} />
          </div>
          <div>
            <h3 className="text-sm font-black text-foreground">
              بازار بین‌المللی تجهیزات و بسته‌های نوسازی خطوط تولید
            </h3>
            <span className="text-[11px] text-muted-foreground">
              نوسازی کارخانجات در بسته‌های ۱۰٪، ۲۵٪ یا ۱۰۰٪ (محاسبه قیمت: ۳۰٪ به
              ازای هر لول اختلاف).
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs bg-secondary/80 px-3.5 py-1.5 rounded-2xl border border-border/70 shrink-0">
          <span className="text-muted-foreground font-sans">
            تعداد کل کارخانجات کشور:
          </span>
          <span className="font-black text-foreground">
            {PersianNumberFormatter.formatNumberWithCommas(totalFactories)} سوله
          </span>
        </div>
      </div>

      {sellers.length === 0 ? (
        <div className="p-12 bg-card/60 border border-border/60 rounded-3xl text-center space-y-2">
          <ShieldCheck size={32} className="text-emerald-400 mx-auto" />
          <span className="text-sm font-black text-foreground block">
            پیشرفته‌ترین صنایع در اختیار شماست
          </span>
          <p className="text-xs text-muted-foreground">
            هیچ کشوری در جهان فناوری صنعتی بالاتری نسبت به تراز تجهیزات فعلی شما
            ندارد.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider font-mono px-1 block">
              انتخاب کشور صادرکننده ماشین‌آلات پیشرفته
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {sellers.map((seller) => (
                <MachinerySellerCard
                  key={seller.id}
                  seller={seller}
                  isSelected={selectedSeller?.id === seller.id}
                  onSelect={setSelectedSellerId}
                />
              ))}
            </div>
          </div>

          {selectedSeller && (
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider font-mono px-1 block">
                بسته‌های نوسازی خطوط تولید با فناوری {selectedSeller.name}
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {tranches.map((tranche) => (
                  <MachineryTrancheCard
                    key={tranche.percentage}
                    tranche={tranche}
                    isSubmitting={isSubmitting}
                    onExecute={handlePurchaseTranche}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
