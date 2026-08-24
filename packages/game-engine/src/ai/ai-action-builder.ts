import { GameAction, Nation, Province } from "@geopolitics/domain";
import { AIProcurementPlanner } from "@/engine/ai/ai-procurement-planner";
import { AIUpgradePlanner } from "@/engine/ai/ai-upgrade-planner";
import { AIEspionagePlanner } from "@/engine/ai/ai-espionage-planner";
import { AIAttackPlanner } from "@/engine/ai/ai-attack-planner";
import { AIPeaceEvaluator } from "@/engine/ai/ai-peace-evaluator";
import { AITreatyEvaluator } from "@/engine/ai/ai-treaty-evaluator";
import { AIEconomicDiplomacyEvaluator } from "@/engine/ai/ai-economic-diplomacy-evaluator";
import { AIWarDeclarationEvaluator } from "@/engine/ai/ai-war-declaration-evaluator";

export class AIActionBuilder {
  public static buildNationActions(
    nation: Nation,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
    lockedTargets?: Set<string>,
    rankMap?: Map<string, number>,
  ): GameAction[] {
    const actions: GameAction[] = [];

    const procurementResult = AIProcurementPlanner.planRecruitment(
      nation,
      allNations,
      provincesMap,
      undefined,
      rankMap,
    );
    actions.push(...procurementResult.actions);

    const upgradeResult = AIUpgradePlanner.planUpgrades(
      nation,
      allNations,
      provincesMap,
      procurementResult.remainingTreasury,
    );
    actions.push(...upgradeResult.actions);

    const espionageResult = AIEspionagePlanner.planEspionage(
      nation,
      allNations,
      provincesMap,
      upgradeResult.remainingTreasury,
      rankMap,
    );
    actions.push(...espionageResult.actions);

    const attackAction = AIAttackPlanner.planAttack(
      nation,
      allNations,
      provincesMap,
    );
    if (attackAction) {
      actions.push(attackAction);
    }

    this.appendDiplomaticAndWarActions(
      nation,
      allNations,
      provincesMap,
      actions,
      espionageResult.remainingTreasury,
      lockedTargets,
      rankMap,
    );

    return actions;
  }

  private static appendDiplomaticAndWarActions(
    nation: Nation,
    allNations: Record<string, Nation>,
    provincesMap: Record<string, Province> | undefined,
    actions: GameAction[],
    availableTreasury?: number,
    lockedTargets?: Set<string>,
    rankMap?: Map<string, number>,
  ): void {
    let currentTreasury =
      availableTreasury !== undefined ? availableTreasury : nation.treasury;

    let aidedTargetId: string | null = null;
    const aidResult = AIEconomicDiplomacyEvaluator.evaluate(
      nation,
      allNations,
      provincesMap,
      currentTreasury,
      rankMap,
    );

    if (aidResult) {
      actions.push(aidResult.action);
      currentTreasury -= aidResult.cost;
      if ("targetNationId" in aidResult.action) {
        aidedTargetId = aidResult.action.targetNationId;
      }
    }

    const peaceAction = AIPeaceEvaluator.evaluate(
      nation,
      allNations,
      provincesMap,
      lockedTargets,
    );

    if (peaceAction) {
      actions.push(peaceAction);
      return;
    }

    const warDeclarationAction = AIWarDeclarationEvaluator.evaluate(
      nation,
      allNations,
      provincesMap,
      lockedTargets,
      rankMap,
    );

    if (warDeclarationAction) {
      const warTargetId =
        "targetNationId" in warDeclarationAction
          ? warDeclarationAction.targetNationId
          : null;

      if (!aidedTargetId || warTargetId !== aidedTargetId) {
        actions.push(warDeclarationAction);
      }
    } else {
      const treatyAction = AITreatyEvaluator.evaluate(
        nation,
        allNations,
        provincesMap,
        lockedTargets,
        rankMap,
      );

      if (treatyAction) {
        actions.push(treatyAction);
      }
    }
  }
}
