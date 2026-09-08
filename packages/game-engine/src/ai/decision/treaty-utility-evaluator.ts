import { Nation } from "@geopolitics/domain";
import { GeopoliticalVector } from "@/engine/ai/geopolitical-vector-calculator";
import { StrategicPartnershipCalculatorUtility } from "@geopolitics/domain";

export class TreatyUtilityEvaluator {
  public static calculateStrategicPartnershipUtility(
    source: Nation,
    vector: GeopoliticalVector,
    targetGdp: number,
  ): number {
    const entryFee =
      StrategicPartnershipCalculatorUtility.calculateSigningCost(targetGdp);
    if (source.treasury < entryFee) {
      return -100;
    }

    const dividendPerTurn =
      StrategicPartnershipCalculatorUtility.calculateTurnDividend(targetGdp);
    const paybackTurns = entryFee / Math.max(1, dividendPerTurn);

    if (paybackTurns > 10 && source.treasury < entryFee * 2) {
      return -50;
    }

    return Math.round(50 + (10 - Math.min(10, paybackTurns)) * 5);
  }

  public static calculateNapUtility(vector: GeopoliticalVector): number {
    const alignmentScore = vector.alignment * 0.6;
    const tensionPenalty = vector.tension * 0.4;

    return Math.round(alignmentScore - tensionPenalty);
  }
}
