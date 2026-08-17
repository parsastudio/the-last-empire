import { GameAction } from "@/domain/game/action.schema";
import { ActionFactory } from "@/domain/game/action-factory";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { TreatyEvaluator } from "@/engine/diplomacy/diplomacy-engine";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { AIThreatCalculator } from "@/engine/ai/ai-threat-calculator";
import { CountryRegistry } from "@/domain/data/countries";

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

    const senderGdp = getNationGdp(nation);

    for (const [targetId, rel] of Object.entries(nation.relations)) {
      const canonicalTarget = CountryRegistry.resolveCanonicalId(targetId);
      const targetNation = allNations[targetId] || allNations[canonicalTarget];

      if (!targetNation || !targetNation.isAlive) {
        continue;
      }

      const targetGdp = getNationGdp(targetNation);
      const cost = TreatyEvaluator.calculateForeignAidCost(
        senderGdp,
        targetGdp,
      );

      if (currentTreasury < cost) {
        continue;
      }

      const threatResult = AIThreatCalculator.evaluate(
        nation,
        targetNation,
        provincesMap,
      );
      const powerRatio = threatResult.powerRatio;

      const isWartimeReparation = rel.stance === "WAR" && powerRatio >= 2.0;

      const isPeacetimeAppeasement =
        rel.stance !== "WAR" &&
        powerRatio >= 1.5 &&
        rel.opinion < 20 &&
        threatResult.isNeighbor;

      if (isWartimeReparation || isPeacetimeAppeasement) {
        return {
          action: ActionFactory.sendForeignAid(nation.id, targetNation.id),
          cost,
        };
      }
    }

    return null;
  }
}
