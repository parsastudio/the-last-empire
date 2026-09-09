import { GameAction } from "@/domain/game/action.schema";
import { ActionFactory } from "@/domain/game/action-factory";
import { Nation } from "@/domain/nation/nation.schema";
import { EspionageCalculator } from "@/engine/espionage/espionage-calculator";
import { CountryRegistry } from "@/domain/data/countries";
import { TurnContext } from "@/engine/pipeline/turn-context";

export class AISabotagePlanner {
  public static planSabotageTier2(
    nation: Nation,
    context: TurnContext,
    geopoliticsBudget: number,
    currentTreasury?: number,
  ): { action: GameAction; cost: number } | null {
    const effectiveTreasury = currentTreasury ?? geopoliticsBudget;
    if (geopoliticsBudget <= 0 || effectiveTreasury <= 0) {
      return null;
    }

    const executedTiers =
      context.state.turnActivity?.[nation.id]?.executedEspionageTiers ?? [];

    const activeWarTarget = nation.warFocusTargetId
      ? context.getNation(nation.warFocusTargetId)
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
          const targetGdp = context.getNationGdp(activeWarTarget.id);
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

      const target = context.getNation(canonicalTarget);

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

        const targetGdp = context.getNationGdp(target.id);
        const cost = EspionageCalculator.calculateOperationCost(targetGdp, 2);

        if (geopoliticsBudget < cost || effectiveTreasury < cost) {
          continue;
        }

        const vector = context.getVector(nation, target);
        if (!vector) continue;

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
