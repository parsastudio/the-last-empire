import { Nation } from "@/domain/nation/nation.schema";

export interface LogisticsEvaluationResult {
  totalCost: number;
  emergencyDebtRequired: number;
  supplyDeficitPenaltyMultiplier: number;
}

export class CampaignLogisticsEvaluator {
  public evaluateCampaignLogistics(
    attacker: Nation,
    isLandNeighbor: boolean,
    pixelPathLength: number | null,
  ): LogisticsEvaluationResult {
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
    }

    const totalCost = baseLogisticsCost + navalTransitCost;
    let emergencyDebtRequired = 0;
    let supplyDeficitPenaltyMultiplier = 1.0;

    if (attacker.treasury < totalCost) {
      emergencyDebtRequired = totalCost - Math.max(0, attacker.treasury);
      supplyDeficitPenaltyMultiplier *= 0.6;
    }

    if (attacker.resources.oil < 20) {
      supplyDeficitPenaltyMultiplier *= 0.7;
    }

    return {
      totalCost,
      emergencyDebtRequired,
      supplyDeficitPenaltyMultiplier: Number(
        supplyDeficitPenaltyMultiplier.toFixed(2),
      ),
    };
  }
}
