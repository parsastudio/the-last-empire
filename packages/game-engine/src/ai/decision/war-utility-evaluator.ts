import {
  Nation,
  NationRelationResolver,
  ResponseCurveUtility,
} from "@geopolitics/domain";
import { GeopoliticalVector } from "@/engine/ai/geopolitical-vector-calculator";

export class WarUtilityEvaluator {
  public static calculate(
    source: Nation,
    target: Nation,
    vector: GeopoliticalVector,
    targetGdp?: number,
    allNations?: Record<string, Nation>,
  ): number {
    if (source.military.infantry < 2 || source.government.stability < 25) {
      return -100;
    }

    if ((vector.proximityTier as string) === "NONE") {
      return -100;
    }

    const tensionCurveFactor = ResponseCurveUtility.sigmoid(vector.tension, 45, 0.1);
    if (tensionCurveFactor < 0.25) {
      return -100;
    }

    if (vector.proximityTier === "NONE") {
      return -100;
    }

    if (
      vector.alignment > 10 &&
      vector.lostProvincesCount === 0 &&
      vector.saturationScore < 60
    ) {
      return -100;
    }

    const continuousAdvantage = ResponseCurveUtility.powerRatioAdvantage(vector.powerRatio);
    let rawPowerAdvantage = Math.round((continuousAdvantage - 0.5) * 100);

    if (
      rawPowerAdvantage <= 0 &&
      vector.lostProvincesCount === 0 &&
      vector.saturationScore < 55
    ) {
      return -100;
    }

    let opportunismBonus = 0;
    if (allNations) {
      const activeEnemies = NationRelationResolver.getActiveWarEnemies(
        target,
        allNations,
      );
      const otherWarsCount = activeEnemies.filter(
        (e) => e.id !== source.id,
      ).length;

      if (otherWarsCount > 0) {
        if (
          vector.alignment <= 0 ||
          vector.lostProvincesCount > 0 ||
          vector.saturationScore >= 50
        ) {
          opportunismBonus += 15;
        } else {
          return -100;
        }
      }
    }

    if (target.government.stability < 30) {
      opportunismBonus += 10;
    }

    const tGdp = targetGdp ?? 50_000_000_000;
    if (target.treasury <= 0 || target.nationalDebt >= tGdp * 0.4) {
      opportunismBonus += 10;
    }

    let proximityMultiplier = 1.0;
    let distancePenalty = 0;

    switch (vector.proximityTier as string) {
      case "DIRECT_NEIGHBOR":
        proximityMultiplier = 1.0;
        distancePenalty = 0;
        break;
      case "REGIONAL_MARITIME":
        proximityMultiplier = 0.72;
        distancePenalty = -14;
        break;
      case "DISTANT_OCEAN":
        proximityMultiplier = 0.28;
        distancePenalty = -38;
        break;
      case "NONE":
      default:
        return -100;
    }

    const powerAdvantageScore =
      rawPowerAdvantage > 0
        ? Math.round(rawPowerAdvantage * proximityMultiplier)
        : rawPowerAdvantage;

    let expansionistDrive = 0;
    if (rawPowerAdvantage > 0) {
      const saturationFactor = ResponseCurveUtility.diminishingReturns(
        Math.max(0, vector.saturationScore - 30),
        35,
      );
      expansionistDrive = Math.round(saturationFactor * 30);
    }

    const tensionScore = Math.round(tensionCurveFactor * 55);
    const alignmentDampener = Math.round(vector.alignment * 0.5);
    const stabilityScore = Math.round(
      ((source.government.stability - 50) / 50) * 15,
    );

    return Math.round(
      tensionScore +
        powerAdvantageScore +
        opportunismBonus +
        expansionistDrive +
        distancePenalty -
        alignmentDampener +
        stabilityScore,
    );
  }
}
