import {
  GameAction,
  Nation,
  Province,
  GeopoliticalReachResolver,
  CountryRegistry,
  NationGettersUtility,
  MilitaryPowerCalculator,
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
import {
  GeopoliticalVectorCalculator,
  GeopoliticalVector,
} from "@/engine/ai/geopolitical-vector-calculator";

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
    rankMap?: Map<string, number>,
    provincesByOwnerMap?: Map<string, Province[]>,
  ): NationDecisionContext {
    const ownedProvinces = NationGettersUtility.getOwnedProvinces(
      nation.id,
      provincesMap,
      provincesByOwnerMap,
    );

    const sourcePower = Math.max(
      1,
      MilitaryPowerCalculator.calculateLandAndAirPower(nation),
    );

    const sourceSeaAccess = ownedProvinces.some((p) => p.hasSeaAccess);

    const reachableTargets = GeopoliticalReachResolver.getReachableTargets(
      nation,
      allNations,
      provincesMap,
      rankMap,
      ownedProvinces,
      provincesByOwnerMap,
    );

    const vectorsByTarget = new Map<string, GeopoliticalVector>();
    let maxTension = 0;
    let isWar = Boolean(nation.warFocusTargetId);

    for (let i = 0; i < reachableTargets.length; i++) {
      const target = reachableTargets[i]!;
      const canonicalTarget = CountryRegistry.resolveCanonicalId(target.id);
      const rel =
        nation.relations[canonicalTarget] || nation.relations[target.id];

      if (rel && rel.stance === "WAR") {
        isWar = true;
      }

      const vector = GeopoliticalVectorCalculator.calculate(
        nation,
        target,
        allNations,
        provincesMap,
        ownedProvinces,
        sourcePower,
        sourceSeaAccess,
        provincesByOwnerMap,
      );

      vectorsByTarget.set(canonicalTarget, vector);

      if (vector.isNeighbor && vector.tension > maxTension) {
        maxTension = vector.tension;
      }
    }

    let posture: AIPosture = "PEACE";
    if (isWar) {
      posture = "WAR";
    } else if (maxTension >= 55) {
      posture = "THREAT";
    }

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
  ): GameAction[] {
    const actions: GameAction[] = [];

    const context = this.buildDecisionContext(
      nation,
      allNations,
      provincesMap,
      rankMap,
      provincesByOwnerMap,
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
