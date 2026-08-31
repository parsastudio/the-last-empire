"use client";

import React, { useState, useRef, useMemo } from "react";
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
import { IndustryModernizeCard } from "./components/industry-modernize-card";
import { IndustrySmartBuildCard } from "./components/industry-smart-build-card";

interface IndustryDomesticTabProps {
  nation: Nation;
  provincesMap?: Record<string, Province>;
}

export function IndustryDomesticTab({
  nation,
  provincesMap,
}: IndustryDomesticTabProps) {
  const [isModernizing, setIsModernizing] = useState<boolean>(false);
  const [isBatchBuilding, setIsBatchBuilding] = useState<boolean>(false);
  const { dispatchAction } = useGameActions();

  const initialTreasuryRef = useRef<number>(nation.treasury);

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

  const factoryCost = IndustryCalculator.FACTORY_REBUILD_COST;

  const batchResult = useMemo(() => {
    return ProcurementBatchCalculator.calculateBatch({
      treasury: nation.treasury,
      baselineTreasury: initialTreasuryRef.current,
      budgetPercentage: 0.1,
      unitPrice: factoryCost,
      baseValuationPrice: factoryCost,
      remainingQuotaRoom: totalEmptySlots,
      remainingValuationCapacity: Number.MAX_SAFE_INTEGER,
      minQuantity: 1,
    });
  }, [nation.treasury, factoryCost, totalEmptySlots]);

  const fixedBatchCount = batchResult.batchQuantity;
  const unitsToBuild = batchResult.canAfford ? batchResult.batchQuantity : 0;
  const batchTotalCost = batchResult.batchCost;
  const canAffordBatch = batchResult.canAfford && totalEmptySlots > 0;

  const canModernize = nation.equipmentTechLevel < nation.industrialLevel;
  const modernizeCost =
    totalActiveFactories *
    IndustryCalculator.calculateModernizeUnitCost(
      nation.equipmentTechLevel,
      nation.industrialLevel,
    );
  const canAffordModernize =
    nation.treasury >= modernizeCost && modernizeCost > 0;

  const handleModernizeAll = async () => {
    if (isModernizing || !canAffordModernize) return;
    setIsModernizing(true);
    try {
      const action = ActionFactory.equipDomesticMachinery(nation.id);
      await dispatchAction(
        action,
        "تمامی خطوط تولید کارخانجات کشور به آخرین فناوری بومی مجهز شدند.",
      );
    } finally {
      setIsModernizing(false);
    }
  };

  const handleSmartBatchBuild = async () => {
    if (isBatchBuilding || !canAffordBatch || unitsToBuild <= 0) return;
    setIsBatchBuilding(true);

    try {
      const workingProvs = ownedProvinces.map((p) => ({ ...p }));
      const actionsToRun: Array<{ nationId: string; provinceId: number }> = [];

      for (let i = 0; i < unitsToBuild; i++) {
        const available = workingProvs.filter(
          (p) => p.factoriesCount < p.maxSlots,
        );
        if (available.length === 0) break;

        available.sort((a, b) => {
          const ratioA = a.maxSlots > 0 ? a.factoriesCount / a.maxSlots : 1;
          const ratioB = b.maxSlots > 0 ? b.factoriesCount / b.maxSlots : 1;
          if (ratioA !== ratioB) return ratioA - ratioB;
          if (a.factoriesCount !== b.factoriesCount)
            return a.factoriesCount - b.factoriesCount;
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IndustryTechUpgradeCard
          nationId={nation.id}
          treasury={nation.treasury}
          industrialLevel={nation.industrialLevel}
        />

        <IndustryModernizeCard
          totalActiveFactories={totalActiveFactories}
          modernizeCost={modernizeCost}
          canModernize={canModernize}
          canAffordModernize={canAffordModernize}
          isModernizing={isModernizing}
          onModernizeAll={handleModernizeAll}
        />
      </div>

      <IndustrySmartBuildCard
        ownedProvinces={ownedProvinces}
        totalEmptySlots={totalEmptySlots}
        fixedBatchCount={fixedBatchCount}
        unitsToBuild={unitsToBuild}
        batchTotalCost={batchTotalCost}
        canAffordBatch={canAffordBatch}
        isBatchBuilding={isBatchBuilding}
        onSmartBatchBuild={handleSmartBatchBuild}
      />
    </div>
  );
}
