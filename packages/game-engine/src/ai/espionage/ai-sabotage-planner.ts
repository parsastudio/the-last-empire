import { GameAction } from "@/domain/game/action.schema";
import { ActionFactory } from "@/domain/game/action-factory";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { EspionageCalculator } from "@/engine/espionage/espionage-calculator";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { CountryRegistry } from "@/domain/data/countries";
import { GeopoliticalVectorCalculator } from "@/engine/ai/geopolitical-vector-calculator";

export class AISabotagePlanner {
  public static planSabotageTier2(
    nation: Nation,
    allNations: Record<string, Nation>,
    provincesMap: Record<string, Province> | undefined,
    geopoliticsBudget: number,
    executedTiers: string[],
    provincesByOwnerMap?: Map<string, Province[]>,
    currentTreasury?: number,
  ): { action: GameAction; cost: number } | null {
    const effectiveTreasury = currentTreasury ?? geopoliticsBudget;
    if (geopoliticsBudget <= 0 || effectiveTreasury <= 0) {
      return null;
    }

    const activeWarTarget = nation.warFocusTargetId
      ? allNations[
          CountryRegistry.resolveCanonicalId(nation.warFocusTargetId)
        ] || allNations[nation.warFocusTargetId]
      : null;

    if (activeWarTarget && activeWarTarget.isAlive) {
      const canonical = CountryRegistry.resolveCanonicalId(activeWarTarget.id);
      if (!executedTiers.includes(`${canonical}:2`)) {
        const successRate = EspionageCalculator.calculateSuccessRate(
          2,
          nation,
          activeWarTarget,
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

          if (
            hasDefenses &&
            geopoliticsBudget >= cost &&
            effectiveTreasury >= cost
          ) {
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
        const successRate = EspionageCalculator.calculateSuccessRate(
          2,
          nation,
          target,
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

        if (geopoliticsBudget < cost || effectiveTreasury < cost) {
          continue;
        }

        const vector = GeopoliticalVectorCalculator.calculate(
          nation,
          target,
          allNations,
          provincesMap,
        );

        const hasDefenses =
          (target.military.airDefense || 0) > 0 ||
          (target.military.armor || 0) > 0 ||
          target.military.airForce > 0;

        const isPreStrikeValid = nation.military.infantry > 1 && hasDefenses;
        const isAsymmetricValid =
          vector.powerRatio > 1.5 && rel.alignment <= -30 && hasDefenses;

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
