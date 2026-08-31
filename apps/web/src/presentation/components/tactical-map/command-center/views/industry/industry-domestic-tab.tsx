"use client";

import React, { useState, useMemo } from "react";
import {
  Nation,
  Province,
  IndustryCalculator,
  ActionFactory,
  PersianNumberFormatter,
  ProcurementBatchCalculator,
} from "@geopolitics/domain";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { IndustryTechUpgradeCard } from "@/presentation/components/tactical-map/sidebar/tabs/politics/industry-tech-upgrade-card";
import { IndustryStatsOverview } from "./components/industry-stats-overview";
import { IndustrySmartBuildCard } from "./components/industry-smart-build-card";
import { FactoryTiersGrid } from "./components/factory-tiers-grid";
import {
  MachineryTrancheCard,
  MachineryTrancheInfo,
} from "./components/machinery-tranche-card";

interface IndustryDomesticTabProps {
  nation: Nation;
  provincesMap?: Record<string, Province>;
}

export function IndustryDomesticTab({
  nation,
  provincesMap,
}: IndustryDomesticTabProps) {
  const [isBatchBuilding, setIsBatchBuilding] = useState<boolean>(false);
  const [isSubmittingTranche, setIsSubmittingTranche] =
    useState<boolean>(false);
  const { dispatchAction } = useGameActions();

  const ownedProvinces = useMemo(() => {
    return provincesMap
      ? Object.values(provincesMap).filter((p) => p.ownerNationId === nation.id)
      : [];
  }, [provincesMap, nation.id]);

  let totalActiveFactories = 0;
  let totalMaxSlots = 0;
  let totalEmptySlots = 0;

  for (const p of ownedProvinces) {
    totalActiveFactories += p.factoriesCount;
    totalMaxSlots += p.maxSlots;
    totalEmptySlots += Math.max(0, p.maxSlots - p.factoriesCount);
  }

  const safeTotalFactories = Math.max(1, totalActiveFactories);
  const currentEquipmentTech = nation.equipmentTechLevel;
  const targetDomesticTech = nation.industrialLevel;
  const isMaxedOut = currentEquipmentTech >= targetDomesticTech;

  const factoryCost = IndustryCalculator.FACTORY_REBUILD_COST;

  const buildBatch = useMemo(() => {
    return ProcurementBatchCalculator.calculateBatch({
      treasury: nation.treasury,
      baselineTreasury: nation.treasury,
      budgetPercentage: 0.1,
      unitPrice: factoryCost,
      baseValuationPrice: factoryCost,
      remainingQuotaRoom: totalEmptySlots,
      remainingValuationCapacity: Number.MAX_SAFE_INTEGER,
      minQuantity: 1,
    });
  }, [nation.treasury, factoryCost, totalEmptySlots]);

  const domesticTranches = useMemo<MachineryTrancheInfo[]>(() => {
    const unitCost = IndustryCalculator.calculateModernizeUnitCost(
      currentEquipmentTech,
      targetDomesticTech,
    );

    const baseIncome =
      safeTotalFactories *
      IndustryCalculator.calculateFactoryYield(currentEquipmentTech);

    const configs = [
      {
        percentage: 0.1,
        percentageLabel: "۱۰٪ کارخانه‌ها",
        badgeTitle: "بسته چابک نوسازی بومی",
        calcQty: Math.max(1, Math.round(safeTotalFactories * 0.1)),
      },
      {
        percentage: 0.25,
        percentageLabel: "۲۵٪ کارخانه‌ها",
        badgeTitle: "بسته توسعه استراتژیک بومی",
        calcQty: Math.max(
          1,
          Math.min(safeTotalFactories, Math.round(safeTotalFactories * 0.25)),
        ),
      },
      {
        percentage: 1.0,
        percentageLabel: "۱۰۰٪ کارخانه‌ها",
        badgeTitle: "نوسازی سراسری خطوط تولید",
        calcQty: safeTotalFactories,
      },
    ];

    return configs.map((cfg) => {
      const quantity = cfg.calcQty;
      const totalCost = quantity * unitCost;
      const projectedTech = IndustryCalculator.calculateNewEquipmentTechLevel(
        safeTotalFactories,
        currentEquipmentTech,
        quantity,
        targetDomesticTech,
      );
      const newIncome =
        safeTotalFactories *
        IndustryCalculator.calculateFactoryYield(projectedTech);
      const projectedIncomeDelta = Math.max(0, newIncome - baseIncome);
      const canAfford = nation.treasury >= totalCost && totalCost > 0;

      return {
        percentage: cfg.percentage,
        percentageLabel: cfg.percentageLabel,
        badgeTitle: cfg.badgeTitle,
        quantity,
        totalFactories: safeTotalFactories,
        totalCost,
        currentTech: currentEquipmentTech,
        targetTech: targetDomesticTech,
        projectedTech,
        projectedIncomeDelta,
        canAfford,
        isMaxedOut,
      };
    });
  }, [
    safeTotalFactories,
    currentEquipmentTech,
    targetDomesticTech,
    nation.treasury,
    isMaxedOut,
  ]);

  const handleModernizeTranche = async (quantity: number) => {
    if (isSubmittingTranche || isMaxedOut) return;
    setIsSubmittingTranche(true);
    try {
      const action = ActionFactory.equipDomesticMachinery(nation.id, quantity);
      await dispatchAction(
        action,
        `خطوط تولید ${quantity} کارخانه با آخرین دانش بومی کشور نوسازی شد.`,
      );
    } finally {
      setIsSubmittingTranche(false);
    }
  };

  const handleSmartBatchBuild = async () => {
    if (
      isBatchBuilding ||
      !buildBatch.canAfford ||
      buildBatch.batchQuantity <= 0
    ) {
      return;
    }
    setIsBatchBuilding(true);

    try {
      const workingProvs = ownedProvinces.map((p) => ({ ...p }));
      const actionsToRun: Array<{ nationId: string; provinceId: number }> = [];

      for (let i = 0; i < buildBatch.batchQuantity; i++) {
        const available = workingProvs.filter(
          (p) => p.factoriesCount < p.maxSlots,
        );
        if (available.length === 0) break;

        available.sort((a, b) => {
          const densityA =
            a.pixelCount > 0
              ? a.factoriesCount / a.pixelCount
              : a.factoriesCount / a.maxSlots;
          const densityB =
            b.pixelCount > 0
              ? b.factoriesCount / b.pixelCount
              : b.factoriesCount / b.maxSlots;
          if (densityA !== densityB) return densityA - densityB;
          const ratioA = a.maxSlots > 0 ? a.factoriesCount / a.maxSlots : 1;
          const ratioB = b.maxSlots > 0 ? b.factoriesCount / b.maxSlots : 1;
          if (ratioA !== ratioB) return ratioA - ratioB;
          return a.provinceId - b.provinceId;
        });

        const target = available[0]!;
        actionsToRun.push({
          nationId: nation.id,
          provinceId: target.provinceId,
        });
        target.factoriesCount += 1;
      }

      for (const item of actionsToRun) {
        const action = ActionFactory.buildFactory(
          item.nationId,
          item.provinceId,
        );
        await dispatchAction(action);
      }
    } finally {
      setIsBatchBuilding(false);
    }
  };

  const factoryYield = IndustryCalculator.calculateFactoryYield(
    nation.equipmentTechLevel,
  );
  const nationalIndustrialOccupancy =
    totalMaxSlots > 0
      ? Math.round((totalActiveFactories / totalMaxSlots) * 100)
      : 100;

  return (
    <div className="space-y-6 dir-rtl text-right font-sans animate-in fade-in duration-200">
      <IndustryStatsOverview
        totalActiveFactories={totalActiveFactories}
        totalMaxSlots={totalMaxSlots}
        nationalIndustrialOccupancy={nationalIndustrialOccupancy}
        factoryYield={factoryYield}
        industrialLevel={nation.industrialLevel}
        equipmentTechLevel={nation.equipmentTechLevel}
      />

      <FactoryTiersGrid
        nationId={nation.id}
        treasury={nation.treasury}
        batches={nation.factoryTiers}
        totalFactories={safeTotalFactories}
        maxDomesticTech={nation.industrialLevel}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        <IndustrySmartBuildCard
          totalActiveFactories={totalActiveFactories}
          totalMaxSlots={totalMaxSlots}
          totalEmptySlots={totalEmptySlots}
          batchQuantity={buildBatch.batchQuantity}
          batchCost={buildBatch.batchCost}
          canAfford={buildBatch.canAfford}
          isBuilding={isBatchBuilding}
          onBuild={handleSmartBatchBuild}
        />

        <IndustryTechUpgradeCard
          nationId={nation.id}
          treasury={nation.treasury}
          industrialLevel={nation.industrialLevel}
        />
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider font-mono">
            بسته‌های نوسازی خطوط تولید با دانش بومی (سقف لِوِل{" "}
            {PersianNumberFormatter.toPersianDigits(
              targetDomesticTech.toFixed(1),
            )}
            )
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">
            نرخ تعدیل: ۳۰٪ قیمت پایه به ازای هر لول اختلاف
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {domesticTranches.map((tranche) => (
            <MachineryTrancheCard
              key={tranche.percentage}
              tranche={tranche}
              isSubmitting={isSubmittingTranche}
              onExecute={handleModernizeTranche}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
