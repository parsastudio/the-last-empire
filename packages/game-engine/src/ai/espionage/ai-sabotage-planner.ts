import { GameAction } from "@/domain/game/action.schema";
import { ActionFactory } from "@/domain/game/action-factory";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { EspionageCalculator } from "@/engine/espionage/espionage-calculator";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { AIThreatCalculator } from "@/engine/ai/ai-threat-calculator";
import { CountryRegistry } from "@/domain/data/countries";
import { NationGettersUtility } from "@geopolitics/domain";

export class AISabotagePlanner {
  public static planSabotageTier2(
    nation: Nation,
    allNations: Record<string, Nation>,
    provincesMap: Record<string, Province> | undefined,
    currentTreasury: number,
    executedTiers: string[],
    rankMap?: Map<string, number>,
    provincesByOwnerMap?: Map<string, Province[]>,
  ): { action: GameAction; cost: number } | null {
    const sourceRank =
      rankMap?.get(CountryRegistry.resolveCanonicalId(nation.id)) ??
      NationGettersUtility.getRank(nation.id, allNations, provincesMap);

    const activeWarTarget = nation.warFocusTargetId
      ? allNations[
          CountryRegistry.resolveCanonicalId(nation.warFocusTargetId)
        ] || allNations[nation.warFocusTargetId]
      : null;

    if (activeWarTarget && activeWarTarget.isAlive) {
      const canonical = CountryRegistry.resolveCanonicalId(activeWarTarget.id);
      if (!executedTiers.includes(`${canonical}:2`)) {
        const targetRank =
          rankMap?.get(canonical) ??
          NationGettersUtility.getRank(
            activeWarTarget.id,
            allNations,
            provincesMap,
          );

        const successRate = EspionageCalculator.calculateSuccessRate(
          2,
          sourceRank,
          targetRank,
        );

        if (successRate >= 0.5) {
          const targetGdp = getNationGdp(
            activeWarTarget,
            provincesMap,
            undefined,
            provincesByOwnerMap,
          );
          const cost = EspionageCalculator.calculateOperationCost(targetGdp, 2);

          const hasDefenses =
            (activeWarTarget.military.airDefense || 0) > 0 ||
            (activeWarTarget.military.armor || 0) > 0 ||
            activeWarTarget.military.airForce > 0;

          if (hasDefenses && currentTreasury >= Math.floor(cost * 1.2)) {
            return {
              action: ActionFactory.executeEspionage(
                nation.id,
                activeWarTarget.id,
                2,
              ),
              cost,
            };
          }
        }
      }
    }

    for (const [targetId, rel] of Object.entries(nation.relations || {})) {
      const canonicalTarget = CountryRegistry.resolveCanonicalId(targetId);
      if (executedTiers.includes(`${canonicalTarget}:2`)) {
        continue;
      }

      const target = allNations[canonicalTarget] || allNations[targetId];

      if (!target || !target.isAlive || target.id === nation.id) {
        continue;
      }

      if (rel.stance === "WAR") {
        const targetRank =
          rankMap?.get(canonicalTarget) ??
          NationGettersUtility.getRank(target.id, allNations, provincesMap);

        const successRate = EspionageCalculator.calculateSuccessRate(
          2,
          sourceRank,
          targetRank,
        );

        if (successRate < 0.5) {
          continue;
        }

        const targetGdp = getNationGdp(
          target,
          provincesMap,
          undefined,
          provincesByOwnerMap,
        );
        const cost = EspionageCalculator.calculateOperationCost(targetGdp, 2);

        if (currentTreasury < Math.floor(cost * 1.2)) {
          continue;
        }

        const evalResult = AIThreatCalculator.evaluate(
          nation,
          target,
          provincesMap,
        );
        const hasDefenses =
          (target.military.airDefense || 0) > 0 ||
          (target.military.armor || 0) > 0 ||
          target.military.airForce > 0;

        const isPreStrikeValid = nation.military.infantry > 1 && hasDefenses;
        const isAsymmetricValid =
          evalResult.powerRatio > 1.5 && rel.alignment <= -30 && hasDefenses;

        if (isPreStrikeValid || isAsymmetricValid) {
          return {
            action: ActionFactory.executeEspionage(nation.id, target.id, 2),
            cost,
          };
        }
      }
    }

    return null;
  }
}
