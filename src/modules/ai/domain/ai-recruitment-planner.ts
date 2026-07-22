import type { Nation } from "@/core/types/nation.types";
import type { RecruitUnitAction } from "@/core/types/actions.types";

export class AIRecruitmentPlanner {
  public planRecruitment(nation: Nation, budget: number): RecruitUnitAction[] {
    const actions: RecruitUnitAction[] = [];
    let remainingBudget = budget;

    const maxInfantryCost = 100;
    const maxAirForceCost = 500;
    const maxNavyCost = 800;

    if (nation.geography.hasSeaAccess && remainingBudget >= maxNavyCost) {
      const qty = Math.floor((remainingBudget * 0.2) / maxNavyCost);
      if (qty > 0) {
        actions.push({
          id: `ai-recruit-navy-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          nationId: nation.id,
          type: "RECRUIT_UNIT",
          unitType: "NAVY",
          quantity: qty,
        });
        remainingBudget -= qty * maxNavyCost;
      }
    }

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
