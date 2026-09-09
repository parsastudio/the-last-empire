import {
  GameAction,
  Nation,
  Province,
  GlobalCoalition,
  NationTurnActivity,
} from "@geopolitics/domain";
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
import { AIEconomicStanceEvaluator } from "@/engine/ai/ai-economic-stance-evaluator";
import { AiWalletBudgetAllocator } from "@/engine/ai/procurement/ai-wallet-budget-allocator";
import { AINationalProjectPlanner } from "@/engine/ai/ai-national-project-planner";
import { TurnContext } from "@/engine/pipeline/turn-context";

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
    turnContext?: TurnContext,
  ): NationDecisionContext {
    const cache =
      matrixCache ??
      turnContext?.matrixCache ??
      GeopoliticalMatrixCache.build(allNations, provincesMap || {});

    const ownedProvinces =
      turnContext?.getOwnedProvinces(nation.id) ??
      cache.getOwnedProvinces(nation.id);
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
    matrixCache?: GeopoliticalMatrixCache,
    globalCoalition?: GlobalCoalition | null,
    currentTurn?: number,
    turnContext?: TurnContext,
    turnActivity?: NationTurnActivity,
  ): GameAction[] {
    const actions: GameAction[] = [];
    let currentNation = nation;

    const stanceAction = AIEconomicStanceEvaluator.evaluateBestStance(
      currentNation,
      allNations,
      provincesMap,
    );

    if (stanceAction) {
      actions.push(stanceAction);
      if (stanceAction.type === "SET_ECONOMIC_DOCTRINE") {
        currentNation = {
          ...currentNation,
          economicStance: stanceAction.stance,
        };
      }
    }

    const cache =
      matrixCache ??
      turnContext?.matrixCache ??
      GeopoliticalMatrixCache.build(allNations, provincesMap || {});

    const context = this.buildDecisionContext(
      currentNation,
      allNations,
      provincesMap,
      cache,
      turnContext,
    );

    const rankMap = cache.getRankMap();
    const provincesByOwnerMap = cache.getProvincesByOwnerMap();

    const wallets = AiWalletBudgetAllocator.calculateWallets(
      currentNation,
      allNations,
      provincesMap,
      context.posture,
      undefined,
      turnContext?.gdpMap,
      turnContext?.totalWorldGdp,
    );

    const procurementResult = AIProcurementPlanner.planRecruitment(
      currentNation,
      allNations,
      provincesMap,
      undefined,
      rankMap,
      context.posture,
      wallets,
    );
    actions.push(...procurementResult.actions);

    const upgradeResult = AIUpgradePlanner.planUpgrades(
      currentNation,
      allNations,
      provincesMap,
      procurementResult.remainingTreasury,
      context.ownedProvinces,
      procurementResult.strategicWallets,
    );
    actions.push(...upgradeResult.actions);

    const projectResult = AINationalProjectPlanner.planProjects(
      currentNation,
      upgradeResult.remainingTreasury,
      context.posture,
      turnActivity?.boostedProjectIds,
    );
    actions.push(...projectResult.actions);

    const treasuryAfterProjects =
      upgradeResult.remainingTreasury - projectResult.spentMoney;

    const espionageResult = AIEspionagePlanner.planEspionage(
      currentNation,
      allNations,
      provincesMap,
      procurementResult.strategicWallets.geopolitics,
      rankMap,
      context.reachableTargets,
      provincesByOwnerMap,
      treasuryAfterProjects,
      turnActivity?.executedEspionageTiers,
    );
    actions.push(...espionageResult.actions);

    const attackAction = AIAttackPlanner.planAttack(
      currentNation,
      allNations,
      provincesMap,
      context.ownedProvinces,
      currentTurn,
    );
    if (attackAction) {
      actions.push(attackAction);
    }

    this.appendDiplomaticAndWarActions(
      currentNation,
      allNations,
      provincesMap,
      actions,
      espionageResult.remainingGeopoliticsBudget,
      lockedTargets,
      rankMap,
      context,
      globalCoalition,
      espionageResult.remainingTreasury,
    );

    return actions;
  }

  private static appendDiplomaticAndWarActions(
    nation: Nation,
    allNations: Record<string, Nation>,
    provincesMap: Record<string, Province> | undefined,
    actions: GameAction[],
    geopoliticsBudget?: number,
    lockedTargets?: Set<string>,
    rankMap?: Map<string, number>,
    context?: NationDecisionContext,
    globalCoalition?: GlobalCoalition | null,
    availableTreasury?: number,
  ): void {
    let currentGeoBudget =
      geopoliticsBudget !== undefined ? geopoliticsBudget : 0;
    let currentTreasury =
      availableTreasury !== undefined ? availableTreasury : nation.treasury;

    let aidedTargetId: string | null = null;
    const aidResult = AIEconomicDiplomacyEvaluator.evaluate(
      nation,
      allNations,
      provincesMap,
      currentGeoBudget,
      rankMap,
      context?.reachableTargets,
      context?.vectorsByTarget,
      globalCoalition,
      currentTreasury,
    );

    if (aidResult) {
      actions.push(aidResult.action);
      currentGeoBudget -= aidResult.cost;
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
      globalCoalition,
    );

    if (peaceAction) {
      actions.push(peaceAction);
      return;
    }

    const cancelAction = AITreatyEvaluator.evaluateTreatyCancellation(
      nation,
      allNations,
      provincesMap,
      lockedTargets,
      context?.vectorsByTarget,
      rankMap,
    );

    if (cancelAction) {
      actions.push(cancelAction);
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
