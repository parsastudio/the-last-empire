import { Nation } from "@geopolitics/domain";
import { GeopoliticalVector } from "@/engine/ai/geopolitical-vector-calculator";

export class TreatyUtilityEvaluator {
  public static calculateStrategicPartnershipUtility(
    source: Nation,
    vector: GeopoliticalVector,
  ): number {
    if (source.globalReputation < -20 || vector.lostProvincesCount > 0) {
      return -100;
    }
    const alignmentScore = vector.alignment * 0.8;
    const tensionPenalty = vector.tension * 0.6;
    const commonEnemyBonus = vector.reasons.commonEnemyBonus;

    return Math.round(alignmentScore - tensionPenalty + commonEnemyBonus);
  }

  public static calculateNapUtility(vector: GeopoliticalVector): number {
    const alignmentScore = vector.alignment * 0.6;
    const tensionPenalty = vector.tension * 0.5;

    return Math.round(alignmentScore - tensionPenalty);
  }
}
