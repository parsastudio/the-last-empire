import {
  GameAction,
  ActionFactory,
  Nation,
  Province,
  CountryRegistry,
  GeopoliticalReachResolver,
  getNationGdp,
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
    availableTreasury?: number,
    rankMap?: Map<string, number>,
    reachableTargets?: Nation[],
    vectorsByTarget?: Map<string, GeopoliticalVector>,
  ): { action: GameAction; cost: number } | null {
    const currentTreasury =
      availableTreasury !== undefined ? availableTreasury : nation.treasury;

    if (currentTreasury <= 0 || !nation.relations) return null;

    const targets =
      reachableTargets ??
      GeopoliticalReachResolver.getReachableTargets(
        nation,
        allNations,
        provincesMap,
        rankMap,
      );

    for (let i = 0; i < targets.length; i++) {
      const targetNation = targets[i]!;
      const canonicalTarget = CountryRegistry.resolveCanonicalId(
        targetNation.id,
      );
      const rel =
        nation.relations[canonicalTarget] || nation.relations[targetNation.id];

      if (!rel || rel.stance === "WAR") continue;

      const vector =
        vectorsByTarget?.get(canonicalTarget) ??
        GeopoliticalVectorCalculator.calculate(
          nation,
          targetNation,
          allNations,
          provincesMap,
        );

      const isAppeasement =
        vector.posture === "WARY_BUFFER" &&
        vector.tension >= 50 &&
        vector.alignment < 10;

      const isAllianceSupport =
        rel.stance === "ALLIANCE" &&
        vector.alignment >= 50 &&
        Boolean(targetNation.warFocusTargetId);

      if (!isAppeasement && !isAllianceSupport) {
        continue;
      }

      const targetGdp = getNationGdp(targetNation, provincesMap);
      const cost = TreatyEvaluator.calculateForeignAidCost(targetGdp);

      if (currentTreasury < Math.floor(cost * 3.0)) {
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
