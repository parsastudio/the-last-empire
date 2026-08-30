import { useMemo, useCallback, useRef, useEffect } from "react";
import {
  UnitType,
  MILITARY_UNIT_STATS,
  MilitaryPricingCalculator,
  MilitaryQuotaCalculator,
  ActionFactory,
  Nation,
} from "@geopolitics/domain";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { useFloatingFeedback } from "@/presentation/hooks/game/use-floating-feedback";

export interface QuickUnitBatchInfo {
  type: UnitType;
  nameFa: string;
  unitPrice: number;
  batchQuantity: number;
  batchCost: number;
  canAfford: boolean;
  remainingRoom: number;
  isCapReached: boolean;
}

const ALL_TYPES: UnitType[] = [
  "INFANTRY",
  "ARMOR",
  "AIR_DEFENSE",
  "AIR_FORCE",
  "DRONE_MISSILE",
];

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

  const baselineTenPercent = Math.max(
    0,
    Math.floor(baselineTreasuryRef.current * 0.1),
  );

  const currentValuation =
    MilitaryPricingCalculator.calculateTotalArmyValuation(nation.military);
  const maxValuation = Math.floor(currentGdp);

  let queuedCost = 0;
  for (let i = 0; i < (nation.recruitmentQueue || []).length; i++) {
    queuedCost += nation.recruitmentQueue[i]!.totalCost;
  }

  const remainingValuationCapacity = Math.max(
    0,
    maxValuation - (currentValuation + queuedCost),
  );

  const quotas = useMemo(() => {
    return MilitaryQuotaCalculator.calculateQuotas(
      currentGdp,
      nation.military,
      nation.recruitmentQueue,
    );
  }, [currentGdp, nation.military, nation.recruitmentQueue]);

  const batchList = useMemo<QuickUnitBatchInfo[]>(() => {
    return ALL_TYPES.map((type) => {
      const stat = MILITARY_UNIT_STATS[type];
      const unitPrice = stat.moneyCost;
      const q = quotas[type];

      const targetBatchQuantity =
        baselineTenPercent > 0 && unitPrice > 0
          ? Math.max(1, Math.floor(baselineTenPercent / unitPrice))
          : 1;

      const affordableByCurrentTreasury =
        unitPrice > 0 ? Math.floor(nation.treasury / unitPrice) : 0;
      const affordableByValuationCap =
        unitPrice > 0 ? Math.floor(remainingValuationCapacity / unitPrice) : 0;
      const allowedByQuota = q.remainingRoom;

      const clampedQuantity = Math.max(
        0,
        Math.min(
          targetBatchQuantity,
          affordableByCurrentTreasury,
          affordableByValuationCap,
          allowedByQuota,
        ),
      );

      const isCapReached =
        q.remainingRoom <= 0 || remainingValuationCapacity < unitPrice;
      const displayQuantity = clampedQuantity > 0 ? clampedQuantity : 1;
      const batchCost = displayQuantity * unitPrice;
      const canAfford =
        nation.treasury >= batchCost && clampedQuantity > 0 && !isCapReached;

      return {
        type,
        nameFa: stat.nameFa,
        unitPrice,
        batchQuantity: displayQuantity,
        batchCost,
        canAfford,
        remainingRoom: q.remainingRoom,
        isCapReached,
      };
    });
  }, [nation.treasury, baselineTenPercent, quotas, remainingValuationCapacity]);

  const handleBuyBatch = useCallback(
    async (info: QuickUnitBatchInfo) => {
      if (!info.canAfford || info.isCapReached) return;

      triggerFeedback(info.type, info.batchQuantity);

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
