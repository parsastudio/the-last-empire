import { GameAction } from "@/domain/game/action.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { AISabotagePlanner } from "@/engine/ai/espionage/ai-sabotage-planner";
import { AITechHeistPlanner } from "@/engine/ai/espionage/ai-tech-heist-planner";

export interface EspionagePlanResult {
  actions: GameAction[];
  spentMoney: number;
  remainingGeopoliticsBudget: number;
  remainingTreasury: number;
}

export class AIEspionagePlanner {
  public static planEspionage(
    nation: Nation,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
    geopoliticsBudget?: number,
    rankMap?: Map<string, number>,
    reachableTargets?: Nation[],
    provincesByOwnerMap?: Map<string, Province[]>,
    availableTreasury?: number,
    executedTiersInput?: string[],
  ): EspionagePlanResult {
    let currentGeoBudget =
      geopoliticsBudget !== undefined
        ? geopoliticsBudget
        : Math.floor(nation.treasury * 0.15);
    let currentTreasury =
      availableTreasury !== undefined ? availableTreasury : nation.treasury;

    const actions: GameAction[] = [];
    let spentMoney = 0;

    if (currentGeoBudget <= 0 || currentTreasury <= 0) {
      return {
        actions,
        spentMoney: 0,
        remainingGeopoliticsBudget: 0,
        remainingTreasury: currentTreasury,
      };
    }

    const executedTiers = executedTiersInput ?? [];

    const sabotageAction = AISabotagePlanner.planSabotageTier2(
      nation,
      allNations,
      provincesMap,
      currentGeoBudget,
      executedTiers,
      provincesByOwnerMap,
      currentTreasury,
    );

    if (sabotageAction) {
      actions.push(sabotageAction.action);
      currentGeoBudget -= sabotageAction.cost;
      currentTreasury -= sabotageAction.cost;
      spentMoney += sabotageAction.cost;
      return {
        actions,
        spentMoney,
        remainingGeopoliticsBudget: Math.max(0, currentGeoBudget),
        remainingTreasury: Math.max(0, currentTreasury),
      };
    }

    const techTheftAction = AITechHeistPlanner.planTechHeistTier3(
      nation,
      allNations,
      provincesMap,
      currentGeoBudget,
      executedTiers,
      rankMap,
      reachableTargets,
      provincesByOwnerMap,
      currentTreasury,
    );

    if (techTheftAction) {
      actions.push(techTheftAction.action);
      currentGeoBudget -= techTheftAction.cost;
      currentTreasury -= techTheftAction.cost;
      spentMoney += techTheftAction.cost;
      return {
        actions,
        spentMoney,
        remainingGeopoliticsBudget: Math.max(0, currentGeoBudget),
        remainingTreasury: Math.max(0, currentTreasury),
      };
    }

    return {
      actions,
      spentMoney: 0,
      remainingGeopoliticsBudget: currentGeoBudget,
      remainingTreasury: currentTreasury,
    };
  }
}
