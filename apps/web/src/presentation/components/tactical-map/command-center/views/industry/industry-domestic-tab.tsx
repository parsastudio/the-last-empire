"use client";

import React, { useState, useMemo } from "react";
import {
  Nation,
  Province,
  IndustryCalculator,
  ActionFactory,
  ProcurementBatchCalculator,
} from "@geopolitics/domain";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { IndustryTechUpgradeCard } from "@/presentation/components/tactical-map/sidebar/tabs/politics/industry-tech-upgrade-card";
import { IndustryStatsOverview } from "./components/industry-stats-overview";
import { IndustrySmartBuildCard } from "./components/industry-smart-build-card";
import { FactoryTiersGrid } from "./components/factory-tiers-grid";

interface IndustryDomesticTabProps {
  nation: Nation;
  provincesMap?: Record<string, Province>;
}

export function IndustryDomesticTab({
  nation,
  provincesMap,
}: IndustryDomesticTabProps) {
  const [isBatchBuilding, setIsBatchBuilding] = useState<boolean>(false);
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

  const totalFactoriesYield = useMemo(() => {
    if (nation.factoryTiers && nation.factoryTiers.length > 0) {
      return IndustryCalculator.calculateBatchesTotalYield(nation.factoryTiers);
    }
    return (
      totalActiveFactories *
      IndustryCalculator.calculateFactoryYield(nation.equipmentTechLevel)
    );
  }, [nation.factoryTiers, totalActiveFactories, nation.equipmentTechLevel]);

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
        totalFactoriesYield={totalFactoriesYield}
        industrialLevel={nation.industrialLevel}
        equipmentTechLevel={nation.equipmentTechLevel}
      />

      <FactoryTiersGrid
        nationId={nation.id}
        treasury={nation.treasury}
        batches={nation.factoryTiers}
        totalFactories={safeTotalFactories}
        targetTechLevel={nation.industrialLevel}
        actionType="DOMESTIC"
        actionLabel="ارتقای بومی"
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
    </div>
  );
}
