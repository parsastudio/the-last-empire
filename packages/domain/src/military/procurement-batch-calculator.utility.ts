export interface ProcurementBatchInput {
  treasury: number;
  baselineTreasury: number;
  budgetPercentage?: number;
  unitPrice: number;
  baseValuationPrice: number;
  remainingQuotaRoom: number;
  remainingValuationCapacity: number;
  minQuantity?: number;
}

export interface ProcurementBatchResult {
  batchQuantity: number;
  batchCost: number;
  canAfford: boolean;
  isCapReached: boolean;
  remainingRoom: number;
}

export class ProcurementBatchCalculator {
  public static calculateBatch(
    input: ProcurementBatchInput,
  ): ProcurementBatchResult {
    const {
      treasury,
      baselineTreasury,
      budgetPercentage = 0.1,
      unitPrice,
      baseValuationPrice,
      remainingQuotaRoom,
      remainingValuationCapacity,
      minQuantity = 1,
    } = input;

    if (unitPrice <= 0) {
      return {
        batchQuantity: 0,
        batchCost: 0,
        canAfford: false,
        isCapReached: true,
        remainingRoom: 0,
      };
    }

    const baselineBudget = Math.max(
      0,
      Math.floor(baselineTreasury * budgetPercentage),
    );

    const targetByBudget =
      baselineBudget > 0
        ? Math.max(minQuantity, Math.floor(baselineBudget / unitPrice))
        : minQuantity;

    const affordableByTreasury =
      unitPrice > 0 ? Math.floor(treasury / unitPrice) : 0;

    const affordableByValuation =
      baseValuationPrice > 0
        ? Math.floor(remainingValuationCapacity / baseValuationPrice)
        : 0;

    const allowedByQuota = Math.max(0, remainingQuotaRoom);

    const clampedQuantity = Math.max(
      0,
      Math.min(
        targetByBudget,
        affordableByTreasury,
        affordableByValuation,
        allowedByQuota,
      ),
    );

    const isCapReached =
      remainingQuotaRoom <= 0 ||
      remainingValuationCapacity < baseValuationPrice;

    const displayQuantity = clampedQuantity > 0 ? clampedQuantity : minQuantity;
    const batchCost = displayQuantity * unitPrice;
    const canAfford =
      treasury >= batchCost && clampedQuantity > 0 && !isCapReached;

    return {
      batchQuantity: displayQuantity,
      batchCost,
      canAfford,
      isCapReached,
      remainingRoom: remainingQuotaRoom,
    };
  }
}
