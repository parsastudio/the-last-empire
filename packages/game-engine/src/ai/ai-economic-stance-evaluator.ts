import {
  GameAction,
  ActionFactory,
  Nation,
  Province,
  EconomicDoctrineStance,
  ALL_ECONOMIC_DOCTRINES,
} from "@geopolitics/domain";
import { FiscalRevenueCalculator } from "@/engine/economy/calculators/fiscal-revenue-calculator";

export class AIEconomicStanceEvaluator {
  public static evaluateBestStance(
    nation: Nation,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
  ): GameAction | null {
    if (!nation.isAlive || !nation.isAi) {
      return null;
    }

    const currentStance: EconomicDoctrineStance =
      nation.economicStance || "BALANCED_MIXED";

    let bestStance: EconomicDoctrineStance = currentStance;
    let highestRevenue = -1;

    for (let i = 0; i < ALL_ECONOMIC_DOCTRINES.length; i++) {
      const candidateStance = ALL_ECONOMIC_DOCTRINES[i]!;
      const candidateNation: Nation = {
        ...nation,
        economicStance: candidateStance,
      };

      const result = FiscalRevenueCalculator.calculate(
        candidateNation,
        allNations,
        provincesMap,
      );

      if (result.totalRevenue > highestRevenue) {
        highestRevenue = result.totalRevenue;
        bestStance = candidateStance;
      }
    }

    if (bestStance !== currentStance) {
      return ActionFactory.setEconomicDoctrine(nation.id, bestStance);
    }

    return null;
  }
}
