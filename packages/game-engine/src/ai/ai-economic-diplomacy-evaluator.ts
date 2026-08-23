import { GameAction } from "@/domain/game/action.schema";
import { ActionFactory } from "@/domain/game/action-factory";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { TreatyEvaluator } from "@/engine/diplomacy/diplomacy-engine";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { AIThreatCalculator } from "@/engine/ai/ai-threat-calculator";
import { CountryRegistry } from "@/domain/data/countries";
import { GeopoliticalReachResolver } from "@/domain/diplomacy/geopolitical-reach-resolver.utility";

export class AIEconomicDiplomacyEvaluator {
  public static evaluate(
    nation: Nation,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
    availableTreasury?: number,
  ): { action: GameAction; cost: number } | null {
    const currentTreasury =
      availableTreasury !== undefined ? availableTreasury : nation.treasury;

    if (currentTreasury <= 0 || !nation.relations) {
      return null;
    }

    for (const [targetId, rel] of Object.entries(nation.relations)) {
      if (rel.stance === "WAR") {
        continue;
      }

      const canonicalTarget = CountryRegistry.resolveCanonicalId(targetId);
      const targetNation = allNations[canonicalTarget] || allNations[targetId];

      if (
        !targetNation ||
        !targetNation.isAlive ||
        targetNation.id === nation.id
      ) {
        continue;
      }

      if (
        !GeopoliticalReachResolver.canInitiateDiplomacy(
          nation,
          targetNation,
          allNations,
          provincesMap,
        )
      ) {
        continue;
      }

      const targetGdp = getNationGdp(targetNation, provincesMap);
      const cost = TreatyEvaluator.calculateForeignAidCost(targetGdp);

      if (currentTreasury < Math.floor(cost * 3.0)) {
        continue;
      }

      const threatResult = AIThreatCalculator.evaluate(
        nation,
        targetNation,
        provincesMap,
        allNations,
      );

      const powerRatio = threatResult.powerRatio;
      const isNeighbor = threatResult.isNeighbor;

      const isPeacetimeAppeasement =
        isNeighbor && powerRatio >= 1.3 && rel.opinion < 20;

      const isHostileThreatAppeasement =
        isNeighbor && rel.opinion < -15 && powerRatio >= 1.5;

      if (isPeacetimeAppeasement || isHostileThreatAppeasement) {
        return {
          action: ActionFactory.sendForeignAid(nation.id, targetNation.id),
          cost,
        };
      }
    }

    return null;
  }
}
