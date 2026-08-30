import {
  GameAction,
  ActionFactory,
  Nation,
  UnitType,
  MilitaryPricingCalculator,
} from "@geopolitics/domain";
import { AIArmsSellerMatcher } from "@/engine/ai/procurement/ai-arms-seller-matcher";
import { UnitBudgetQuota } from "@geopolitics/domain";

export interface ArmsImportPlanResult {
  actions: GameAction[];
  spentMoney: number;
  spentValuation: number;
  remainingImportBudget: number;
  remainingGlobalValuation: number;
}

export class AIArmsImportPlanner {
  public static planImports(
    nation: Nation,
    allNations: Record<string, Nation>,
    quotas: Record<UnitType, UnitBudgetQuota>,
    initialImportBudget: number,
    initialGlobalValuation: number,
    unitTypes: UnitType[],
  ): ArmsImportPlanResult {
    const actions: GameAction[] = [];
    let targetImportBudget = initialImportBudget;
    let globalRemainingValuation = initialGlobalValuation;
    let spentMoney = 0;
    let spentValuation = 0;

    const eligibleSellers = AIArmsSellerMatcher.findEligibleArmsSellers(
      nation,
      allNations,
    );

    if (eligibleSellers.length === 0) {
      return {
        actions,
        spentMoney: 0,
        spentValuation: 0,
        remainingImportBudget: 0,
        remainingGlobalValuation: globalRemainingValuation,
      };
    }

    const bestSeller = eligibleSellers[0]!;

    for (let i = 0; i < unitTypes.length; i++) {
      const type = unitTypes[i]!;
      const q = quotas[type];
      if (!q || q.remainingRoom <= 0 || targetImportBudget <= 0) continue;

      const unitPrice = MilitaryPricingCalculator.calculateArmsImportUnitPrice(
        type,
        nation.military.techLevel,
        bestSeller.military.techLevel,
      );

      const maxUnitsByMoney = Math.floor(targetImportBudget / unitPrice);
      const baseUnitPrice =
        MilitaryPricingCalculator.calculateUnitTypePrice(type);
      const maxUnitsByValuation = Math.floor(
        globalRemainingValuation / baseUnitPrice,
      );
      const allowedUnits = Math.min(
        q.remainingRoom,
        maxUnitsByMoney,
        maxUnitsByValuation,
      );

      if (allowedUnits > 0) {
        const cost = allowedUnits * unitPrice;
        const valuationCost = allowedUnits * baseUnitPrice;

        actions.push(
          ActionFactory.buyArmsMarket(
            nation.id,
            bestSeller.id,
            type,
            allowedUnits,
          ),
        );

        targetImportBudget -= cost;
        spentMoney += cost;
        spentValuation += valuationCost;
        globalRemainingValuation -= valuationCost;
        q.remainingRoom -= allowedUnits;
      }
    }

    return {
      actions,
      spentMoney,
      spentValuation,
      remainingImportBudget: targetImportBudget,
      remainingGlobalValuation: globalRemainingValuation,
    };
  }
}
