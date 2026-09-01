import {
  GameAction,
  ActionFactory,
  Nation,
  UnitType,
  MilitaryPricingCalculator,
  UnitBudgetQuota,
} from "@geopolitics/domain";
import { AIArmsSellerMatcher } from "@/engine/ai/procurement/ai-arms-seller-matcher";

export interface ArmsImportPlanResult {
  actions: GameAction[];
  spentMoney: number;
  spentValuation: number;
  remainingImportBudget: number;
  remainingGlobalValuation: number;
}

export class AIArmsImportPlanner {
  public static readonly MAX_IMPORT_SELLERS = 10;

  private static calculateDecayWeights(count: number): number[] {
    if (count <= 0) return [];
    if (count === 1) return [1.0];

    const rawWeights = new Array<number>(count);
    let sum = 0;
    for (let i = 0; i < count; i++) {
      const w = Math.pow(11 - (i + 1), 1.4);
      rawWeights[i] = w;
      sum += w;
    }

    return rawWeights.map((w) => w / (sum || 1));
  }

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
        remainingImportBudget: 0,
        remainingGlobalValuation: initialGlobalValuation,
      };
    }

    const weights = this.calculateDecayWeights(eligibleSellers.length);
    let remainingGlobalValuation = initialGlobalValuation;
    let spentMoney = 0;
    let spentValuation = 0;

    for (let sIdx = 0; sIdx < eligibleSellers.length; sIdx++) {
      const seller = eligibleSellers[sIdx]!;
      const sellerWeight = weights[sIdx] || 0;
      let sellerBudget = Math.floor(initialImportBudget * sellerWeight);

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

        if (unitPrice <= 0) continue;

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
      remainingImportBudget: Math.max(0, initialImportBudget - spentMoney),
      remainingGlobalValuation,
    };
  }
}
