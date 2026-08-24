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
    const nationStart = performance.now();
    const actions: GameAction[] = [];

    const tProcStart = performance.now();
    const procurementResult = AIProcurementPlanner.planRecruitment(
      nation,
      allNations,
      provincesMap,
      undefined,
      rankMap,
    );
    const tProc = performance.now() - tProcStart;
    actions.push(...procurementResult.actions);

    const tUpgStart = performance.now();
    const upgradeResult = AIUpgradePlanner.planUpgrades(
      nation,
      allNations,
      provincesMap,
      procurementResult.remainingTreasury,
    );
    const tUpg = performance.now() - tUpgStart;
    actions.push(...upgradeResult.actions);

    const tEspStart = performance.now();
    const espionageResult = AIEspionagePlanner.planEspionage(
      nation,
      allNations,
      provincesMap,
      upgradeResult.remainingTreasury,
      rankMap,
    );
    const tEsp = performance.now() - tEspStart;
    actions.push(...espionageResult.actions);

    const tAtkStart = performance.now();
    const attackAction = AIAttackPlanner.planAttack(
      nation,
      allNations,
      provincesMap,
    );
    const tAtk = performance.now() - tAtkStart;
    if (attackAction) {
      actions.push(attackAction);
    }

    const tDipStart = performance.now();
    this.appendDiplomaticAndWarActions(
      nation,
      allNations,
      provincesMap,
      actions,
      espionageResult.remainingTreasury,
      lockedTargets,
      rankMap,
    );
    const tDip = performance.now() - tDipStart;

    const nationDuration = performance.now() - nationStart;

    if (nationDuration > 2) {
      console.log(
        `[AI_NATION_PERF] ${nation.name} (${nation.id}): ${nationDuration.toFixed(2)}ms [تجهیزات: ${tProc.toFixed(2)}ms | ارتقا: ${tUpg.toFixed(2)}ms | جاسوسی: ${tEsp.toFixed(2)}ms | تهاجم: ${tAtk.toFixed(2)}ms | دیپلماسی: ${tDip.toFixed(2)}ms]`,
      );
    }

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
