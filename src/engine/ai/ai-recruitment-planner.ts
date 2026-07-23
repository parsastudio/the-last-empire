import type { Nation } from "@/domain/nation/nation.schema";
import type { RecruitUnitAction } from "@/domain/game/action.schema";
import { UpkeepCalculator } from "@/engine/economy/upkeep-calculator";
import { TaxCalculator } from "@/engine/economy/tax-calculator";

export class AIRecruitmentPlanner {
  private upkeepCalculator = new UpkeepCalculator();
  private taxCalculator = new TaxCalculator();

  public planRecruitment(nation: Nation, budget: number): RecruitUnitAction[] {
    const actions: RecruitUnitAction[] = [];

    const upkeep = this.upkeepCalculator.calculateUpkeep(nation);
    const tax = this.taxCalculator.evaluateTaxPolicy(nation);
    const netIncome = tax.taxIncome - upkeep.total;

    if (netIncome <= 2000 && nation.treasury < 50000) {
      return actions;
    }

    let remainingBudget = budget;
    let remainingManpower = nation.resources.manpower;
    let remainingSteel = nation.resources.steel;

    const maxInfantryCost = 100;
    const maxAirForceCost = 500;

    if (
      remainingBudget >= maxAirForceCost &&
      remainingManpower >= 5 &&
      remainingSteel >= 2
    ) {
      const maxAffordableByBudget = Math.floor(
        (remainingBudget * 0.3) / maxAirForceCost,
      );
      const maxAffordableByManpower = Math.floor(remainingManpower / 5);
      const maxAffordableBySteel = Math.floor(remainingSteel / 2);
      const qty = Math.min(
        maxAffordableByBudget,
        maxAffordableByManpower,
        maxAffordableBySteel,
      );

      if (qty > 0) {
        actions.push({
          id: `ai-recruit-air-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          nationId: nation.id,
          type: "RECRUIT_UNIT",
          unitType: "AIR_FORCE",
          quantity: qty,
        });
        remainingBudget -= qty * maxAirForceCost;
        remainingManpower -= qty * 5;
        remainingSteel -= qty * 2;
      }
    }

    if (remainingBudget >= maxInfantryCost && remainingManpower >= 10) {
      const maxAffordableByBudget = Math.floor(
        remainingBudget / maxInfantryCost,
      );
      const maxAffordableByManpower = Math.floor(remainingManpower / 10);
      const qty = Math.min(maxAffordableByBudget, maxAffordableByManpower);

      if (qty > 0) {
        actions.push({
          id: `ai-recruit-inf-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          nationId: nation.id,
          type: "RECRUIT_UNIT",
          unitType: "INFANTRY",
          quantity: qty,
        });
      }
    }
    return actions;
  }
}
