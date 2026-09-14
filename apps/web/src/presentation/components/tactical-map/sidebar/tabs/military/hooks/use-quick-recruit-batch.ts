import { useMemo, useCallback, useRef, useEffect } from "react";
import {
  MilitaryPricingCalculator,
  MilitaryQuotaCalculator,
  ActionFactory,
  Nation,
  ProcurementBatchCalculator,
  ALL_MILITARY_UNIT_TYPES,
} from "@geopolitics/domain";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { useFloatingFeedback } from "@/presentation/hooks/game/use-floating-feedback";
import { ProcurementUnitItemInfo } from "../components/procurement-unit-card";

export type QuickUnitBatchInfo = ProcurementUnitItemInfo;

interface UseQuickRecruitBatchProps {
  nationId: string;
  nation: Nation;
  currentGdp: number;
}

export function useQuickRecruitBatch({
  nationId,
  nation,
  currentGdp,
}: UseQuickRecruitBatchProps) {
  const { dispatchAction } = useGameActions();
  const { feedbacks, triggerFeedback } = useFloatingFeedback();

  const baselineTreasuryRef = useRef<number>(nation.treasury);
  const prevNationIdRef = useRef<string>(nationId);

  if (prevNationIdRef.current !== nationId) {
    prevNationIdRef.current = nationId;
    baselineTreasuryRef.current = nation.treasury;
  }

  useEffect(() => {
    if (nation.treasury > baselineTreasuryRef.current) {
      baselineTreasuryRef.current = nation.treasury;
    }
  }, [nation.treasury]);

  const remainingValuationCapacity =
    MilitaryPricingCalculator.calculateRemainingArmyValuation(
      currentGdp,
      nation.military,
    );

  const quotas = useMemo(() => {
    return MilitaryQuotaCalculator.calculateQuotas(currentGdp, nation.military);
  }, [currentGdp, nation.military]);

  const batchList = useMemo<QuickUnitBatchInfo[]>(() => {
    return ALL_MILITARY_UNIT_TYPES.map((type) => {
      const unitPrice = MilitaryPricingCalculator.calculateUnitTypePrice(
        type,
        nation.government?.type,
      );
      const q = quotas[type];

      const batchResult = ProcurementBatchCalculator.calculateBatch({
        treasury: nation.treasury,
        baselineTreasury: baselineTreasuryRef.current,
        budgetPercentage: 0.1,
        unitPrice,
        baseValuationPrice: unitPrice,
        remainingQuotaRoom: q.remainingRoom,
        remainingValuationCapacity,
        minQuantity: 1,
      });

      return {
        type,
        unitPrice,
        batchQuantity: batchResult.batchQuantity,
        batchCost: batchResult.batchCost,
        canAfford: batchResult.canAfford,
        remainingRoom: batchResult.remainingRoom,
        isCapReached: batchResult.isCapReached,
      };
    });
  }, [
    nation.treasury,
    nation.government?.type,
    quotas,
    remainingValuationCapacity,
  ]);

  const handleBuyBatch = useCallback(
    async (info: QuickUnitBatchInfo) => {
      if (!info.canAfford || info.isCapReached) return;

      triggerFeedback(info.type, info.batchQuantity, { playSound: false });

      const action = ActionFactory.recruitUnit(
        nationId,
        info.type,
        info.batchQuantity,
      );

      await dispatchAction(action);
    },
    [nationId, dispatchAction, triggerFeedback],
  );

  return {
    batchList,
    floatingFeedbacks: feedbacks,
    handleBuyBatch,
  };
}
