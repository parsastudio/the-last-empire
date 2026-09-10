"use client";

import { useMemo, useCallback } from "react";
import {
  FactoryBatch,
  IndustryCalculator,
  ActionFactory,
  ProcurementBatchCalculator,
} from "@geopolitics/domain";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { useFloatingFeedback } from "@/presentation/hooks/game/use-floating-feedback";

export interface FactoryTierUpgradeItem {
  batch: FactoryBatch;
  rankIndex: number;
  isMaxedOut: boolean;
  unitCost: number;
  targetTech: number;
  batchQuantity: number;
  batchCost: number;
  canAfford: boolean;
}

interface UseFactoryTierProcurementProps {
  nationId: string;
  treasury: number;
  batches?: FactoryBatch[];
  targetTechLevel: number;
  buyerIndustrialLevel?: number;
  totalFactories: number;
  sellerId?: string;
  actionType?: "DOMESTIC" | "IMPORT";
}

export function useFactoryTierProcurement({
  nationId,
  treasury,
  batches,
  targetTechLevel,
  buyerIndustrialLevel = 1.0,
  totalFactories,
  sellerId,
  actionType = "DOMESTIC",
}: UseFactoryTierProcurementProps) {
  const { dispatchAction, isSubmitting } = useGameActions();
  const { triggerFeedback, getFeedbacksFor } = useFloatingFeedback<number>();

  const consolidatedBatches = useMemo(() => {
    if (batches && batches.length > 0) {
      return IndustryCalculator.consolidateBatches(batches);
    }
    return [{ techLevel: targetTechLevel, count: totalFactories }];
  }, [batches, targetTechLevel, totalFactories]);

  const tierUpgradeItems = useMemo<FactoryTierUpgradeItem[]>(() => {
    return consolidatedBatches.map((batch, index) => {
      const isMaxedOut = batch.techLevel >= targetTechLevel;
      const unitCost = isMaxedOut
        ? 0
        : actionType === "IMPORT"
          ? IndustryCalculator.calculateEquipmentImportPrice(
              targetTechLevel,
              batch.techLevel,
              buyerIndustrialLevel,
            )
          : IndustryCalculator.calculateModernizeUnitCost(
              batch.techLevel,
              targetTechLevel,
            );

      const batchResult = isMaxedOut
        ? { batchQuantity: 0, batchCost: 0, canAfford: false }
        : ProcurementBatchCalculator.calculateBatch({
            treasury,
            baselineTreasury: treasury,
            budgetPercentage: 0.1,
            unitPrice: unitCost,
            baseValuationPrice: unitCost,
            remainingQuotaRoom: batch.count,
            remainingValuationCapacity: Number.MAX_SAFE_INTEGER,
            minQuantity: 1,
          });

      return {
        batch,
        rankIndex: index,
        isMaxedOut,
        unitCost,
        targetTech: targetTechLevel,
        batchQuantity: batchResult.batchQuantity,
        batchCost: batchResult.batchCost,
        canAfford: batchResult.canAfford,
      };
    });
  }, [
    consolidatedBatches,
    targetTechLevel,
    buyerIndustrialLevel,
    actionType,
    treasury,
  ]);

  const handleUpgradeTier = useCallback(
    async (item: FactoryTierUpgradeItem) => {
      if (item.isMaxedOut || !item.canAfford || isSubmitting) return;

      const feedbackText =
        actionType === "IMPORT"
          ? `+${item.batchQuantity} سوله وارداتی`
          : `+${item.batchQuantity} سوله مدرن`;

      triggerFeedback(item.rankIndex, feedbackText, { durationMs: 700 });

      if (actionType === "IMPORT" && sellerId) {
        const action = ActionFactory.buyIndustrialEquipment(
          nationId,
          sellerId,
          item.batchQuantity,
          item.batch.techLevel,
        );
        await dispatchAction(action);
      } else {
        const action = ActionFactory.equipDomesticMachinery(
          nationId,
          item.batchQuantity,
          item.batch.techLevel,
        );
        await dispatchAction(action);
      }
    },
    [
      nationId,
      sellerId,
      actionType,
      isSubmitting,
      dispatchAction,
      triggerFeedback,
    ],
  );

  return {
    tierUpgradeItems,
    getFeedbacksFor,
    isSubmitting,
    handleUpgradeTier,
  };
}
