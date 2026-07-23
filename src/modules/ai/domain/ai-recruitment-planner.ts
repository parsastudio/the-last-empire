import type { Nation } from "@/modules/nation/schemas/nation.schema";
import type { RecruitUnitAction } from "@/modules/game-engine/schemas/action.schema";

export class AIRecruitmentPlanner {
  public planRecruitment(nation: Nation, budget: number): RecruitUnitAction[] {
    const actions: RecruitUnitAction[] = [];
    let remainingBudget = budget;
    const maxInfantryCost = 100;
    const maxAirForceCost = 500;

    if (remainingBudget >= maxAirForceCost) {
      const qty = Math.floor((remainingBudget * 0.3) / maxAirForceCost);
      if (qty > 0) {
        actions.push({
          id: `ai-recruit-air-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          nationId: nation.id,
          type: "RECRUIT_UNIT",
          unitType: "AIR_FORCE",
          quantity: qty,
        });
        remainingBudget -= qty * maxAirForceCost;
      }
    }

    if (remainingBudget >= maxInfantryCost) {
      const qty = Math.floor(remainingBudget / maxInfantryCost);
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
