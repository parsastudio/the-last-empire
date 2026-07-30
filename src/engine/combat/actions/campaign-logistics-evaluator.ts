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
      (8000 * internalDistanceFactor) / infrastructureBonus,
    );

    let heavyTransitCost = 0;
    if (!isLandNeighbor && pixelPathLength !== null && pixelPathLength > 0) {
      const costPerWaterPixel = 150;
      heavyTransitCost = pixelPathLength * costPerWaterPixel;
    } else if (isLandNeighbor) {
      heavyTransitCost = Math.floor(baseLogisticsCost * 0.3);
    }

    const totalCost = baseLogisticsCost + heavyTransitCost;
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
