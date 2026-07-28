import type { Nation } from "@/domain/nation/nation.schema";
import type { RecruitUnitAction } from "@/domain/game/action.schema";
import { UpkeepCalculator } from "@/engine/economy/upkeep-calculator";
import { TaxCalculator } from "@/engine/economy/tax-calculator";
import { DeterministicIdGenerator } from "./utils/deterministic-id-generator";

export class AIRecruitmentPlanner {
  private upkeepCalculator = new UpkeepCalculator();
  private taxCalculator = new TaxCalculator();
  private idGenerator = new DeterministicIdGenerator();

  public planRecruitment(
    nation: Nation,
    budget: number,
    currentTurn = 1,
  ): RecruitUnitAction[] {
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
    let seq = 1;

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
          id: this.idGenerator.generateActionId(
            "RECRUIT_UNIT",
            nation.id,
            currentTurn,
            seq++,
          ),
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
          id: this.idGenerator.generateActionId(
            "RECRUIT_UNIT",
            nation.id,
            currentTurn,
            seq++,
          ),
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
