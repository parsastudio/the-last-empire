import type { Nation } from "@/core/types/nation.types";

export class TransitFeeCalculator {
  public calculateTransitFeeIncome(
    intermediaryNation: Nation,
    volumePassingThrough: number,
  ): number {
    const feeRate = 0.02;
    const infrastructureBonus =
      1 + intermediaryNation.geography.infrastructureLevel * 0.1;

    return Math.floor(volumePassingThrough * feeRate * infrastructureBonus);
  }
}
