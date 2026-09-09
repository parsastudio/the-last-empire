import {
  GameAction,
  ActionFactory,
  Nation,
  EconomicDoctrineStance,
  ALL_ECONOMIC_DOCTRINES,
  FiscalRevenueCalculator,
} from "@geopolitics/domain";
import { TurnContext } from "@/engine/pipeline/turn-context";

export class AIEconomicStanceEvaluator {
  public static evaluateBestStance(
    nation: Nation,
    context: TurnContext,
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
        context.state.nations,
        context.state.provinces,
        context.aiRevenueMultiplier,
        context.gdpMap,
        context.totalWorldGdp,
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
