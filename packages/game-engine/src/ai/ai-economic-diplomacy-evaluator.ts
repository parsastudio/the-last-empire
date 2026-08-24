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
import { GeopoliticalVectorCalculator } from "@/engine/ai/geopolitical-vector-calculator";

export class AIEconomicDiplomacyEvaluator {
  public static evaluate(
    nation: Nation,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
    availableTreasury?: number,
    rankMap?: Map<string, number>,
  ): { action: GameAction; cost: number } | null {
    const currentTreasury =
      availableTreasury !== undefined ? availableTreasury : nation.treasury;

    if (currentTreasury <= 0 || !nation.relations) return null;

    const reachableTargets = GeopoliticalReachResolver.getReachableTargets(
      nation,
      allNations,
      provincesMap,
      rankMap,
    );

    for (const targetNation of reachableTargets) {
      const canonicalTarget = CountryRegistry.resolveCanonicalId(
        targetNation.id,
      );
      const rel =
        nation.relations[canonicalTarget] || nation.relations[targetNation.id];

      if (!rel || rel.stance === "WAR") continue;

      const targetGdp = getNationGdp(targetNation, provincesMap);
      const cost = TreatyEvaluator.calculateForeignAidCost(targetGdp);

      if (currentTreasury < Math.floor(cost * 3.0)) continue;

      const vector = GeopoliticalVectorCalculator.calculate(
        nation,
        targetNation,
        allNations,
        provincesMap,
      );

      const isAppeasement =
        vector.posture === "WARY_BUFFER" &&
        vector.tension >= 50 &&
        rel.opinion < 10;

      const isAllianceSupport =
        rel.stance === "ALLIANCE" &&
        vector.alignment >= 50 &&
        Boolean(targetNation.warFocusTargetId);

      if (isAppeasement || isAllianceSupport) {
        return {
          action: ActionFactory.sendForeignAid(nation.id, targetNation.id),
          cost,
        };
      }
    }

    return null;
  }
}
