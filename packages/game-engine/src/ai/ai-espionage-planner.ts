import { GameAction } from "@/domain/game/action.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { AISabotagePlanner } from "@/engine/ai/espionage/ai-sabotage-planner";
import { AITechHeistPlanner } from "@/engine/ai/espionage/ai-tech-heist-planner";

export interface EspionagePlanResult {
  actions: GameAction[];
  remainingTreasury: number;
}

export class AIEspionagePlanner {
  public static planEspionage(
    nation: Nation,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
    availableTreasury?: number,
    rankMap?: Map<string, number>,
    reachableTargets?: Nation[],
    provincesByOwnerMap?: Map<string, Province[]>,
  ): EspionagePlanResult {
    let currentTreasury =
      availableTreasury !== undefined ? availableTreasury : nation.treasury;
    const actions: GameAction[] = [];

    if (currentTreasury <= 0) {
      return { actions, remainingTreasury: 0 };
    }

    const executedTiers = nation.executedEspionageTiers || [];

    const sabotageAction = AISabotagePlanner.planSabotageTier2(
      nation,
      allNations,
      provincesMap,
      currentTreasury,
      executedTiers,
      rankMap,
      provincesByOwnerMap,
    );

    if (sabotageAction) {
      actions.push(sabotageAction.action);
      currentTreasury -= sabotageAction.cost;
      return {
        actions,
        remainingTreasury: Math.max(0, currentTreasury),
      };
    }

    const techTheftAction = AITechHeistPlanner.planTechHeistTier3(
      nation,
      allNations,
      provincesMap,
      currentTreasury,
      executedTiers,
      rankMap,
      reachableTargets,
      provincesByOwnerMap,
    );

    if (techTheftAction) {
      actions.push(techTheftAction.action);
      currentTreasury -= techTheftAction.cost;
      return {
        actions,
        remainingTreasury: Math.max(0, currentTreasury),
      };
    }

    return {
      actions,
      remainingTreasury: currentTreasury,
    };
  }
}
