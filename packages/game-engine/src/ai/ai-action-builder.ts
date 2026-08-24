import { GameAction, Nation, Province } from "@geopolitics/domain";
import {
  AIProcurementPlanner,
  AIPosture,
} from "@/engine/ai/ai-procurement-planner";
import { AIUpgradePlanner } from "@/engine/ai/ai-upgrade-planner";
import { AIEspionagePlanner } from "@/engine/ai/ai-espionage-planner";
import { AIAttackPlanner } from "@/engine/ai/ai-attack-planner";
import { AIPeaceEvaluator } from "@/engine/ai/ai-peace-evaluator";
import { AITreatyEvaluator } from "@/engine/ai/ai-treaty-evaluator";
import { AIEconomicDiplomacyEvaluator } from "@/engine/ai/ai-economic-diplomacy-evaluator";
import { AIWarDeclarationEvaluator } from "@/engine/ai/ai-war-declaration-evaluator";
import { GeopoliticalVector } from "@/engine/ai/geopolitical-vector-calculator";
import { GeopoliticalMatrixCache } from "@/engine/ai/geopolitical-matrix-cache";

interface NationDecisionContext {
  ownedProvinces: Province[];
  reachableTargets: Nation[];
  vectorsByTarget: Map<string, GeopoliticalVector>;
  posture: AIPosture;
}

export class AIActionBuilder {
  private static buildDecisionContext(
    nation: Nation,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
    matrixCache?: GeopoliticalMatrixCache,
  ): NationDecisionContext {
    const cache =
      matrixCache ??
      GeopoliticalMatrixCache.build(allNations, provincesMap || {});

    const ownedProvinces = cache.getOwnedProvinces(nation.id);
    const reachableTargets = cache.getReachableTargets(
      nation,
      allNations,
      provincesMap,
    );
    const vectorsByTarget = cache.getVectorsForNation(
      nation,
      allNations,
      provincesMap,
    );
    const posture = cache.getPosture(nation, allNations, provincesMap);

    return {
      ownedProvinces,
      reachableTargets,
      vectorsByTarget,
      posture,
    };
  }

  public static buildNationActions(
    nation: Nation,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
    lockedTargets?: Set<string>,
    rankMap?: Map<string, number>,
    provincesByOwnerMap?: Map<string, Province[]>,
    matrixCache?: GeopoliticalMatrixCache,
  ): GameAction[] {
    const actions: GameAction[] = [];

    const context = this.buildDecisionContext(
      nation,
      allNations,
      provincesMap,
      matrixCache,
    );

    const procurementResult = AIProcurementPlanner.planRecruitment(
      nation,
      allNations,
      provincesMap,
      undefined,
      rankMap,
      context.posture,
    );
    actions.push(...procurementResult.actions);

    const upgradeResult = AIUpgradePlanner.planUpgrades(
      nation,
      allNations,
      provincesMap,
      procurementResult.remainingTreasury,
      rankMap,
      context.posture,
      context.ownedProvinces,
    );
    actions.push(...upgradeResult.actions);

    const espionageResult = AIEspionagePlanner.planEspionage(
      nation,
      allNations,
      provincesMap,
      upgradeResult.remainingTreasury,
      rankMap,
      context.reachableTargets,
      provincesByOwnerMap,
    );
    actions.push(...espionageResult.actions);

    const attackAction = AIAttackPlanner.planAttack(
      nation,
      allNations,
      provincesMap,
      context.ownedProvinces,
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
      context,
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
    context?: NationDecisionContext,
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
      context?.reachableTargets,
      context?.vectorsByTarget,
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
      context?.vectorsByTarget,
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
      context?.reachableTargets,
      context?.vectorsByTarget,
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
        context?.reachableTargets,
        context?.vectorsByTarget,
      );

      if (treatyAction) {
        actions.push(treatyAction);
      }
    }
  }
}
