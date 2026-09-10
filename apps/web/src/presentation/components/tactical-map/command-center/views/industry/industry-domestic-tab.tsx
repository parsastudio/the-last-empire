"use client";

import React, { useState, useMemo } from "react";
import {
  Nation,
  Province,
  IndustryCalculator,
  ActionFactory,
  ProcurementBatchCalculator,
  NationGettersUtility,
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

  const capacity = useMemo(() => {
    return NationGettersUtility.getTerritoryIndustrialCapacity(
      nation.id,
      provincesMap,
      ownedProvinces,
    );
  }, [nation.id, provincesMap, ownedProvinces]);

  const safeTotalFactories = Math.max(1, capacity.totalActiveFactories);
  const factoryCost = IndustryCalculator.FACTORY_REBUILD_COST;

  const buildBatch = useMemo(() => {
    return ProcurementBatchCalculator.calculateBatch({
      treasury: nation.treasury,
      baselineTreasury: nation.treasury,
      budgetPercentage: 0.1,
      unitPrice: factoryCost,
      baseValuationPrice: factoryCost,
      remainingQuotaRoom: capacity.totalEmptySlots,
      remainingValuationCapacity: Number.MAX_SAFE_INTEGER,
      minQuantity: 1,
    });
  }, [nation.treasury, factoryCost, capacity.totalEmptySlots]);

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
      const action = ActionFactory.buildFactory(
        nation.id,
        buildBatch.batchQuantity,
      );
      await dispatchAction(action);
    } finally {
      setIsBatchBuilding(false);
    }
  };

  const currentNationalTiers = useMemo(() => {
    return NationGettersUtility.getNationFactoryTiers(
      nation.id,
      provincesMap,
      ownedProvinces,
    );
  }, [nation.id, provincesMap, ownedProvinces]);

  const totalFactoriesYield = useMemo(() => {
    if (currentNationalTiers.length > 0) {
      return IndustryCalculator.calculateBatchesTotalYield(
        currentNationalTiers,
      );
    }
    return (
      capacity.totalActiveFactories *
      IndustryCalculator.calculateFactoryYield(nation.equipmentTechLevel)
    );
  }, [
    currentNationalTiers,
    capacity.totalActiveFactories,
    nation.equipmentTechLevel,
  ]);

  return (
    <div className="space-y-6 dir-rtl text-right font-sans animate-in fade-in duration-200">
      <IndustryStatsOverview
        totalActiveFactories={capacity.totalActiveFactories}
        totalMaxSlots={capacity.totalMaxSlots}
        nationalIndustrialOccupancy={capacity.occupancyPercentage}
        totalFactoriesYield={totalFactoriesYield}
        industrialLevel={nation.industrialLevel}
        equipmentTechLevel={nation.equipmentTechLevel}
      />

      <FactoryTiersGrid
        nationId={nation.id}
        treasury={nation.treasury}
        batches={currentNationalTiers}
        totalFactories={safeTotalFactories}
        targetTechLevel={nation.industrialLevel}
        actionType="DOMESTIC"
        actionLabel="ارتقای بومی"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        <IndustrySmartBuildCard
          totalActiveFactories={capacity.totalActiveFactories}
          totalMaxSlots={capacity.totalMaxSlots}
          totalEmptySlots={capacity.totalEmptySlots}
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
          governmentType={nation.government?.type}
        />
      </div>
    </div>
  );
}
