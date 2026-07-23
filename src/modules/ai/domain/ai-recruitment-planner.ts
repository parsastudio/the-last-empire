import type { Nation } from "@/modules/nation/schemas/nation.schema";
import type { RecruitUnitAction } from "@/modules/game-engine/schemas/action.schema";

export class AIRecruitmentPlanner {
  public planRecruitment(nation: Nation, budget: number): RecruitUnitAction[] {
    const actions: RecruitUnitAction[] = [];
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
