import { useMemo, useCallback, useRef, useEffect } from "react";
import {
  UnitType,
  MILITARY_UNIT_STATS,
  MilitaryPricingCalculator,
  MilitaryQuotaCalculator,
  ActionFactory,
  getNationGdp,
} from "@geopolitics/domain";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { useFloatingFeedback } from "@/presentation/hooks/game/use-floating-feedback";

export interface AlliedUnitProcurementInfo {
  type: UnitType;
  nameFa: string;
  unitPrice: number;
  techMultiplier: number;
  techDelta: number;
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

  const baselineTreasuryRef = useRef<number>(buyerNation.treasury);
  const prevBuyerIdRef = useRef<string>(buyerNation.id);
  const prevSellerIdRef = useRef<string>(sellerNation.id);

  if (
    prevBuyerIdRef.current !== buyerNation.id ||
    prevSellerIdRef.current !== sellerNation.id
  ) {
    prevBuyerIdRef.current = buyerNation.id;
    prevSellerIdRef.current = sellerNation.id;
    baselineTreasuryRef.current = buyerNation.treasury;
  }

  useEffect(() => {
    if (buyerNation.treasury > baselineTreasuryRef.current) {
      baselineTreasuryRef.current = buyerNation.treasury;
    }
  }, [buyerNation.treasury]);

  const baselineTenPercent = Math.max(
    0,
    Math.floor(baselineTreasuryRef.current * 0.1),
  );

  const effectiveBuyerGdp = useMemo(() => {
    if (currentGdp !== undefined && currentGdp > 0) return currentGdp;
    return getNationGdp(buyerNation, provincesMap);
  }, [currentGdp, buyerNation, provincesMap]);

  const currentValuation =
    MilitaryPricingCalculator.calculateTotalArmyValuation(buyerNation.military);
  const maxValuation = Math.floor(effectiveBuyerGdp);

  const remainingValuationCapacity = Math.max(
    0,
    maxValuation - currentValuation,
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
    return ALL_TYPES.map((type) => {
      const stat = MILITARY_UNIT_STATS[type];
      const baseCost = stat.moneyCost;
      const marketUnitPrice =
        MilitaryPricingCalculator.calculateArmsImportUnitPrice(
          type,
          buyerNation.military.techLevel,
          sellerNation.military.techLevel,
        );
      const q = quotas[type];

      const targetBatchQuantity =
        baselineTenPercent > 0 && marketUnitPrice > 0
          ? Math.max(1, Math.floor(baselineTenPercent / marketUnitPrice))
          : 1;

      const affordableByCurrentTreasury =
        marketUnitPrice > 0
          ? Math.floor(buyerNation.treasury / marketUnitPrice)
          : 0;
      const affordableByValuationCap =
        baseCost > 0 ? Math.floor(remainingValuationCapacity / baseCost) : 0;
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
        q.remainingRoom <= 0 || remainingValuationCapacity < baseCost;
      const displayQuantity = clampedQuantity > 0 ? clampedQuantity : 1;
      const batchCost = displayQuantity * marketUnitPrice;
      const canAfford =
        buyerNation.treasury >= batchCost &&
        clampedQuantity > 0 &&
        !isCapReached;

      return {
        type,
        nameFa: stat.nameFa,
        unitPrice: marketUnitPrice,
        techMultiplier,
        techDelta,
        batchQuantity: displayQuantity,
        batchCost,
        canAfford,
        remainingRoom: q.remainingRoom,
        isCapReached,
      };
    });
  }, [
    buyerNation.treasury,
    buyerNation.military.techLevel,
    sellerNation.military.techLevel,
    baselineTenPercent,
    quotas,
    remainingValuationCapacity,
    techMultiplier,
    techDelta,
  ]);

  const handleBuyAlliedBatch = useCallback(
    async (info: AlliedUnitProcurementInfo) => {
      if (!info.canAfford || info.isCapReached) return;

      triggerFeedback(info.type, info.batchQuantity);

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
