import {
  GameAction,
  ActionFactory,
  Nation,
  Province,
  CountryRegistry,
  GeopoliticalReachResolver,
  getNationGdp,
  GlobalCoalition,
  NationRelationResolver,
} from "@geopolitics/domain";
import { TreatyEvaluator } from "@/engine/diplomacy/diplomacy-engine";
import {
  GeopoliticalVectorCalculator,
  GeopoliticalVector,
} from "@/engine/ai/geopolitical-vector-calculator";

export class AIEconomicDiplomacyEvaluator {
  public static evaluate(
    nation: Nation,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
    geopoliticsBudget?: number,
    rankMap?: Map<string, number>,
    reachableTargets?: Nation[],
    vectorsByTarget?: Map<string, GeopoliticalVector>,
    globalCoalition?: GlobalCoalition | null,
    availableTreasury?: number,
  ): { action: GameAction; cost: number } | null {
    const currentBudget =
      geopoliticsBudget !== undefined
        ? geopoliticsBudget
        : Math.floor(nation.treasury * 0.15);
    const currentTreasury =
      availableTreasury !== undefined ? availableTreasury : nation.treasury;

    if (currentBudget <= 0 || currentTreasury <= 0 || !nation.relations) {
      return null;
    }

    const sourceGdp = getNationGdp(nation, provincesMap);
    const targets =
      reachableTargets ??
      GeopoliticalReachResolver.getReachableTargets(
        nation,
        allNations,
        provincesMap,
        rankMap,
      );

    const hegemonicTargetId = globalCoalition?.targetNationId;

    for (let i = 0; i < targets.length; i++) {
      const targetNation = targets[i]!;
      const canonicalTarget = CountryRegistry.resolveCanonicalId(
        targetNation.id,
      );

      if (hegemonicTargetId && canonicalTarget === hegemonicTargetId) {
        continue;
      }

      const rel = NationRelationResolver.getRelation(
        nation.relations,
        canonicalTarget,
      );

      if (!rel || rel.stance === "WAR") continue;

      const vector =
        vectorsByTarget?.get(canonicalTarget) ??
        GeopoliticalVectorCalculator.calculate(
          nation,
          targetNation,
          allNations,
          provincesMap,
        );

      if (vector.tension >= 30 || vector.alignment < 0) {
        continue;
      }

      const targetGdp = getNationGdp(targetNation, provincesMap);

      const isDiplomaticCultivation =
        rel.stance !== "STRATEGIC_PARTNERSHIP" &&
        vector.alignment >= 20 &&
        vector.tension < 15 &&
        sourceGdp >= targetGdp * 0.8 &&
        vector.posture === "NATURAL_ALLY";

      if (!isDiplomaticCultivation) {
        continue;
      }

      const cost = TreatyEvaluator.calculateForeignAidCost(targetGdp);

      if (currentBudget < cost || currentTreasury < cost) {
        continue;
      }

      return {
        action: ActionFactory.sendForeignAid(nation.id, targetNation.id),
        cost,
      };
    }

    return null;
  }
}
