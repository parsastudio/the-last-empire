import { GameAction } from "@/domain/game/action.schema";
import { ActionFactory } from "@/domain/game/action-factory";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { AIThreatCalculator } from "@/engine/ai/ai-threat-calculator";
import { CountryRegistry } from "@/domain/data/countries";

export class AIPeaceEvaluator {
  public static evaluate(
    nation: Nation,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
  ): GameAction | null {
    if (!nation.relations) {
      return null;
    }

    for (const [targetId, rel] of Object.entries(nation.relations)) {
      if (rel.stance !== "WAR") {
        continue;
      }

      const canonicalTarget = CountryRegistry.resolveCanonicalId(targetId);
      const targetNation = allNations[targetId] || allNations[canonicalTarget];

      if (
        !targetNation ||
        !targetNation.isAlive ||
        targetNation.id === nation.id
      ) {
        continue;
      }

      const threatResult = AIThreatCalculator.evaluate(
        nation,
        targetNation,
        provincesMap,
      );

      const powerRatio = threatResult.powerRatio;
      const myStability = nation.government.stability;

      const isSurvivalPeace = powerRatio >= 2.5 || myStability < 30;

      if (isSurvivalPeace) {
        return ActionFactory.diplomaticProposal(
          nation.id,
          targetNation.id,
          "PEACE_TREATY",
        );
      }

      const isStalematePeace =
        powerRatio >= 0.75 && powerRatio <= 1.3 && myStability < 45;

      if (isStalematePeace) {
        return ActionFactory.diplomaticProposal(
          nation.id,
          targetNation.id,
          "PEACE_TREATY",
        );
      }

      const targetNumericId = CountryRegistry.resolveNumericId(targetNation.id);
      let hasCapturedProvince = false;

      if (provincesMap && targetNumericId > 0) {
        for (const pid of nation.provinceIds || []) {
          const prov = provincesMap[pid.toString()];
          if (prov && prov.countryNumericId === targetNumericId) {
            hasCapturedProvince = true;
            break;
          }
        }
      }

      let hasThirdPartyThreat = false;
      for (const [otherId, otherRel] of Object.entries(
        nation.relations || {},
      )) {
        if (otherId === targetNation.id || otherRel.stance === "WAR") {
          continue;
        }

        const canonicalOther = CountryRegistry.resolveCanonicalId(otherId);
        const otherNation = allNations[otherId] || allNations[canonicalOther];

        if (otherNation && otherNation.isAlive) {
          const otherEval = AIThreatCalculator.evaluate(
            nation,
            otherNation,
            provincesMap,
          );
          if (otherEval.threatScore > 50 && otherEval.isNeighbor) {
            hasThirdPartyThreat = true;
            break;
          }
        }
      }

      const isCounterAttackRisk = powerRatio >= 0.75;
      const isConsolidationPeace =
        hasCapturedProvince && (hasThirdPartyThreat || isCounterAttackRisk);

      if (isConsolidationPeace) {
        return ActionFactory.diplomaticProposal(
          nation.id,
          targetNation.id,
          "PEACE_TREATY",
        );
      }
    }

    return null;
  }
}
