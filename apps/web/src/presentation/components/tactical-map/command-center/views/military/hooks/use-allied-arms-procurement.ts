import { useMemo, useCallback } from "react";
import {
  MILITARY_UNIT_STATS,
  MilitaryPricingCalculator,
  MilitaryQuotaCalculator,
  ActionFactory,
  getNationGdp,
  Nation,
  Province,
  ProcurementBatchCalculator,
  ALL_MILITARY_UNIT_TYPES,
} from "@geopolitics/domain";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { useFloatingFeedback } from "@/presentation/hooks/game/use-floating-feedback";
import { useBaselineTreasury } from "@/presentation/hooks/common/use-baseline-treasury";
import { ProcurementUnitItemInfo } from "@/presentation/components/tactical-map/sidebar/tabs/military/components/procurement-unit-card";

export type AlliedUnitProcurementInfo = ProcurementUnitItemInfo;

interface UseAlliedArmsProcurementProps {
  buyerNation: Nation;
  sellerNation: Nation;
  provincesMap?: Record<string, Province>;
  currentGdp?: number;
}

export function useAlliedArmsProcurement({
  buyerNation,
  sellerNation,
  provincesMap,
  currentGdp,
}: UseAlliedArmsProcurementProps) {
  const { dispatchAction } = useGameActions();
  const { feedbacks, triggerFeedback } = useFloatingFeedback();

  const baselineTreasury = useBaselineTreasury(buyerNation.treasury, [
    buyerNation.id,
    sellerNation.id,
  ]);

  const effectiveBuyerGdp = useMemo(() => {
    if (currentGdp !== undefined && currentGdp > 0) return currentGdp;
    return getNationGdp(buyerNation, provincesMap);
  }, [currentGdp, buyerNation, provincesMap]);

  const remainingValuationCapacity =
    MilitaryPricingCalculator.calculateRemainingArmyValuation(
      effectiveBuyerGdp,
      buyerNation.military,
    );

  const quotas = useMemo(() => {
    return MilitaryQuotaCalculator.calculateQuotas(
      effectiveBuyerGdp,
      buyerNation.military,
    );
  }, [effectiveBuyerGdp, buyerNation.military]);

  const techMultiplier = useMemo(() => {
    return MilitaryPricingCalculator.calculateArmsImportMultiplier(
      buyerNation.military.techLevel,
      sellerNation.military.techLevel,
    );
  }, [buyerNation.military.techLevel, sellerNation.military.techLevel]);

  const techDelta = useMemo(() => {
    return Number(
      Math.max(
        0,
        sellerNation.military.techLevel - buyerNation.military.techLevel,
      ).toFixed(1),
    );
  }, [buyerNation.military.techLevel, sellerNation.military.techLevel]);

  const batchList = useMemo<AlliedUnitProcurementInfo[]>(() => {
    return ALL_MILITARY_UNIT_TYPES.map((type) => {
      const stat = MILITARY_UNIT_STATS[type];
      const baseUnitPrice = stat.moneyCost;
      const marketUnitPrice =
        MilitaryPricingCalculator.calculateArmsImportUnitPrice(
          type,
          buyerNation.military.techLevel,
          sellerNation.military.techLevel,
        );
      const q = quotas[type];

      const batchResult = ProcurementBatchCalculator.calculateBatch({
        treasury: buyerNation.treasury,
        baselineTreasury,
        budgetPercentage: 0.1,
        unitPrice: marketUnitPrice,
        baseValuationPrice: baseUnitPrice,
        remainingQuotaRoom: q.remainingRoom,
        remainingValuationCapacity,
        minQuantity: 1,
      });

      return {
        type,
        unitPrice: marketUnitPrice,
        techMultiplier,
        techDelta,
        batchQuantity: batchResult.batchQuantity,
        batchCost: batchResult.batchCost,
        canAfford: batchResult.canAfford,
        remainingRoom: batchResult.remainingRoom,
        isCapReached: batchResult.isCapReached,
      };
    });
  }, [
    buyerNation.treasury,
    buyerNation.military.techLevel,
    sellerNation.military.techLevel,
    quotas,
    remainingValuationCapacity,
    techMultiplier,
    techDelta,
    baselineTreasury,
  ]);

  const handleBuyAlliedBatch = useCallback(
    async (info: AlliedUnitProcurementInfo) => {
      if (!info.canAfford || info.isCapReached) return;

      triggerFeedback(info.type, info.batchQuantity, { playSound: false });

      const action = ActionFactory.buyArmsMarket(
        buyerNation.id,
        sellerNation.id,
        info.type,
        info.batchQuantity,
      );

      await dispatchAction(action);
    },
    [buyerNation.id, sellerNation.id, dispatchAction, triggerFeedback],
  );

  return {
    batchList,
    techMultiplier,
    techDelta,
    floatingFeedbacks: feedbacks,
    handleBuyAlliedBatch,
  };
}
