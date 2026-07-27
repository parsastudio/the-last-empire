import { Nation } from "@/domain/nation/nation.schema";

export class CampaignLogisticsEvaluator {
  public calculateTotalCampaignCost(
    attacker: Nation,
    isLandNeighbor: boolean,
    pixelPathLength: number | null,
  ): number {
    const internalDistanceFactor = Math.sqrt(
      attacker.geography.territorySize || 100,
    );
    const infrastructureBonus =
      1.0 + attacker.geography.infrastructureLevel * 0.15;
    const baseLogisticsCost = Math.floor(
      (12000 * internalDistanceFactor) / infrastructureBonus,
    );

    let navalTransitCost = 0;
    if (pixelPathLength !== null && pixelPathLength > 0) {
      const costPerWaterPixel = 200;
      navalTransitCost = pixelPathLength * costPerWaterPixel;
    } else if (!isLandNeighbor) {
      return -1;
    }

    return baseLogisticsCost + navalTransitCost;
  }
}
