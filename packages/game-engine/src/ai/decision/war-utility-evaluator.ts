import { Nation, NationRelationResolver } from "@geopolitics/domain";
import { GeopoliticalVector } from "@/engine/ai/geopolitical-vector-calculator";

export class WarUtilityEvaluator {
  public static calculate(
    source: Nation,
    target: Nation,
    vector: GeopoliticalVector,
    targetGdp?: number,
    allNations?: Record<string, Nation>,
  ): number {
    if (vector.tension < 35) {
      return -100;
    }

    if (source.military.infantry < 2 || source.government.stability < 25) {
      return -100;
    }

    if (vector.proximityTier === "NONE") {
      return -100;
    }

    if (vector.alignment > 10 && vector.lostProvincesCount === 0) {
      return -100;
    }

    let rawPowerAdvantage = 0;
    if (vector.powerRatio > 1.0) {
      rawPowerAdvantage = -Math.round((vector.powerRatio - 1.0) * 60);
    } else {
      rawPowerAdvantage = Math.round((1.0 - vector.powerRatio) * 50);
    }

    if (rawPowerAdvantage <= 0 && vector.lostProvincesCount === 0) {
      return -100;
    }

    let opportunismBonus = 0;
    if (allNations) {
      const activeEnemies = NationRelationResolver.getActiveWarEnemies(
        target,
        allNations,
      );
      if (activeEnemies.some((e) => e.id !== source.id)) {
        opportunismBonus += 25;
      }
    }

    if (target.government.stability < 35) {
      opportunismBonus += 20;
    }

    const tGdp = targetGdp ?? 50_000_000_000;
    if (target.treasury <= 0 || target.nationalDebt >= tGdp * 0.4) {
      opportunismBonus += 15;
    }

    let proximityMultiplier = 1.0;
    let distancePenalty = 0;

    switch (vector.proximityTier) {
      case "DIRECT_NEIGHBOR":
        proximityMultiplier = 1.0;
        distancePenalty = 0;
        break;
      case "REGIONAL_MARITIME":
        proximityMultiplier = 0.7;
        distancePenalty = -15;
        break;
      case "DISTANT_OCEAN":
        proximityMultiplier = 0.3;
        distancePenalty = -40;
        break;
      default:
        return -100;
    }

    const powerAdvantageScore =
      rawPowerAdvantage > 0
        ? Math.round(rawPowerAdvantage * proximityMultiplier)
        : rawPowerAdvantage;

    const tensionScore = Math.round(vector.tension * 0.5);
    const alignmentDampener = Math.round(vector.alignment * 0.5);
    const stabilityScore = Math.round(
      ((source.government.stability - 50) / 50) * 15,
    );

    return Math.round(
      tensionScore +
        powerAdvantageScore +
        opportunismBonus +
        distancePenalty -
        alignmentDampener +
        stabilityScore,
    );
  }
}
