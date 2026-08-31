"use client";

import { useState, useMemo, useCallback } from "react";
import {
  FactoryBatch,
  IndustryCalculator,
  ActionFactory,
  ProcurementBatchCalculator,
} from "@geopolitics/domain";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { TacticalSound } from "@/presentation/utils/tactical-sound";

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
  maxDomesticTech: number;
  totalFactories: number;
}

export function useFactoryTierProcurement({
  nationId,
  treasury,
  batches,
  maxDomesticTech,
  totalFactories,
}: UseFactoryTierProcurementProps) {
  const { dispatchAction, isSubmitting } = useGameActions();
  const [feedbacks, setFeedbacks] = useState<
    Record<number, { id: string; text: string }[]>
  >({});

  const consolidatedBatches = useMemo(() => {
    if (batches && batches.length > 0) {
      return IndustryCalculator.consolidateBatches(batches);
    }
    return [{ techLevel: maxDomesticTech, count: totalFactories }];
  }, [batches, maxDomesticTech, totalFactories]);

  const tierUpgradeItems = useMemo<FactoryTierUpgradeItem[]>(() => {
    return consolidatedBatches.map((batch, index) => {
      const isMaxedOut = batch.techLevel >= maxDomesticTech;
      const unitCost = isMaxedOut
        ? 0
        : IndustryCalculator.calculateModernizeUnitCost(
            batch.techLevel,
            maxDomesticTech,
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
        targetTech: maxDomesticTech,
        batchQuantity: batchResult.batchQuantity,
        batchCost: batchResult.batchCost,
        canAfford: batchResult.canAfford,
      };
    });
  }, [consolidatedBatches, maxDomesticTech, treasury]);

  const handleUpgradeTier = useCallback(
    async (item: FactoryTierUpgradeItem) => {
      if (item.isMaxedOut || !item.canAfford || isSubmitting) return;

      TacticalSound.playCoinSound();
      const feedbackId = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const feedbackText = `+${item.batchQuantity} سوله مدرن`;

      setFeedbacks((prev) => ({
        ...prev,
        [item.rankIndex]: [
          ...(prev[item.rankIndex] || []),
          { id: feedbackId, text: feedbackText },
        ],
      }));

      setTimeout(() => {
        setFeedbacks((prev) => ({
          ...prev,
          [item.rankIndex]: (prev[item.rankIndex] || []).filter(
            (f) => f.id !== feedbackId,
          ),
        }));
      }, 700);

      const action = ActionFactory.equipDomesticMachinery(
        nationId,
        item.batchQuantity,
      );
      await dispatchAction(action);
    },
    [nationId, isSubmitting, dispatchAction],
  );

  return {
    tierUpgradeItems,
    feedbacks,
    isSubmitting,
    handleUpgradeTier,
  };
}
