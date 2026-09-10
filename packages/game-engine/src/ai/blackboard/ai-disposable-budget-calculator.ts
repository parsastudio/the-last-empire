import {
  Nation,
  ProvinceDynamicState,
  NationalBudgetCalculator,
} from "@geopolitics/domain";

export interface AiDisposableBudgetBreakdown {
  gdp: number;
  grossRevenue: number;
  fixedExpenses: number;
  turnSurplus: number;
  totalDisposable: number;
  isEmbargoed: boolean;
}

export class AiDisposableBudgetCalculator {
  public static calculate(
    nation: Nation,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, ProvinceDynamicState>,
    availableTreasury?: number,
    precomputedGdpMap?: Map<string, number>,
    precomputedTotalWorldGdp?: number,
  ): AiDisposableBudgetBreakdown {
    const budget = NationalBudgetCalculator.calculate(
      nation,
      allNations,
      provincesMap,
      availableTreasury,
      1.0,
      precomputedGdpMap,
      precomputedTotalWorldGdp,
    );

    return {
      gdp: budget.gdp,
      grossRevenue: budget.grossRevenue,
      fixedExpenses: budget.fixedExpenses,
      turnSurplus: budget.turnSurplus,
      totalDisposable: budget.totalDisposable,
      isEmbargoed: budget.isEmbargoed,
    };
  }
}
