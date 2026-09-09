import {
  GameAction,
  ActionFactory,
  Nation,
  UnitType,
  MilitaryPricingCalculator,
  UnitBudgetQuota,
} from "@geopolitics/domain";
import { AIArmsSellerMatcher } from "@/engine/ai/procurement/ai-arms-seller-matcher";
import { AiProcurementWeightsUtility } from "@/engine/ai/procurement/ai-procurement-weights.utility";

export interface ArmsImportPlanResult {
  actions: GameAction[];
  spentMoney: number;
  spentValuation: number;
  remainingImportBudget: number;
  remainingGlobalValuation: number;
}

export class AIArmsImportPlanner {
  public static readonly MAX_IMPORT_SELLERS = 10;

  public static planImports(
    nation: Nation,
    allNations: Record<string, Nation>,
    quotas: Record<UnitType, UnitBudgetQuota>,
    initialImportBudget: number,
    initialGlobalValuation: number,
    unitTypes: UnitType[],
  ): ArmsImportPlanResult {
    const actions: GameAction[] = [];
    if (initialImportBudget <= 0 || initialGlobalValuation <= 0) {
      return {
        actions,
        spentMoney: 0,
        spentValuation: 0,
        remainingImportBudget: 0,
        remainingGlobalValuation: initialGlobalValuation,
      };
    }

    const eligibleSellers = AIArmsSellerMatcher.findEligibleArmsSellers(
      nation,
      allNations,
    ).slice(0, this.MAX_IMPORT_SELLERS);

    if (eligibleSellers.length === 0) {
      return {
        actions,
        spentMoney: 0,
        spentValuation: 0,
        remainingImportBudget: initialImportBudget,
        remainingGlobalValuation: initialGlobalValuation,
      };
    }

    const weights = AiProcurementWeightsUtility.calculateDecayWeights(
      eligibleSellers.length,
      1.4,
    );
    let remainingGlobalValuation = initialGlobalValuation;
    let spentMoney = 0;
    let spentValuation = 0;
    let remainingBudget = initialImportBudget;

    for (let sIdx = 0; sIdx < eligibleSellers.length; sIdx++) {
      const seller = eligibleSellers[sIdx]!;
      const sellerWeight = weights[sIdx] || 0;
      let sellerBudget = Math.min(
        remainingBudget,
        Math.floor(initialImportBudget * sellerWeight),
      );

      if (sellerBudget <= 0 || remainingGlobalValuation <= 0) continue;

      for (let i = 0; i < unitTypes.length; i++) {
        const type = unitTypes[i]!;
        const q = quotas[type];
        if (!q || q.remainingRoom <= 0 || sellerBudget <= 0) continue;

        const unitPrice =
          MilitaryPricingCalculator.calculateArmsImportUnitPrice(
            type,
            nation.military.techLevel,
            seller.military.techLevel,
          );

        if (unitPrice <= 0 || unitPrice > sellerBudget) continue;

        const maxUnitsByMoney = Math.floor(sellerBudget / unitPrice);
        const baseUnitPrice =
          MilitaryPricingCalculator.calculateUnitTypePrice(type);
        const maxUnitsByValuation =
          baseUnitPrice > 0
            ? Math.floor(remainingGlobalValuation / baseUnitPrice)
            : 0;

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
              seller.id,
              type,
              allowedUnits,
            ),
          );

          sellerBudget -= cost;
          remainingBudget -= cost;
          spentMoney += cost;
          spentValuation += valuationCost;
          remainingGlobalValuation -= valuationCost;
          q.remainingRoom -= allowedUnits;
        }
      }
    }

    return {
      actions,
      spentMoney,
      spentValuation,
      remainingImportBudget: Math.max(0, remainingBudget),
      remainingGlobalValuation,
    };
  }
}
