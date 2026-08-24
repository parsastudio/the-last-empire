import { GameAction } from "@/domain/game/action.schema";
import { ActionFactory } from "@/domain/game/action-factory";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { EspionageCalculator } from "@/engine/espionage/espionage-calculator";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { AIThreatCalculator } from "@/engine/ai/ai-threat-calculator";
import { CountryRegistry } from "@/domain/data/countries";
import { GeopoliticalReachResolver } from "@/domain/diplomacy/geopolitical-reach-resolver.utility";

export interface EspionagePlanResult {
  actions: GameAction[];
  remainingTreasury: number;
}

export class AIEspionagePlanner {
  public static planEspionage(
    nation: Nation,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
    availableTreasury?: number,
    rankMap?: Map<string, number>,
  ): EspionagePlanResult {
    let currentTreasury =
      availableTreasury !== undefined ? availableTreasury : nation.treasury;
    const actions: GameAction[] = [];

    if (currentTreasury <= 0) {
      return { actions, remainingTreasury: 0 };
    }

    const executedTiers = nation.executedEspionageTiers || [];

    const sabotageAction = this.planSabotageTier2(
      nation,
      allNations,
      provincesMap,
      currentTreasury,
      executedTiers,
    );

    if (sabotageAction) {
      actions.push(sabotageAction.action);
      currentTreasury -= sabotageAction.cost;
      return {
        actions,
        remainingTreasury: Math.max(0, currentTreasury),
      };
    }

    const techTheftAction = this.planTechHeistTier3(
      nation,
      allNations,
      provincesMap,
      currentTreasury,
      executedTiers,
      rankMap,
    );

    if (techTheftAction) {
      actions.push(techTheftAction.action);
      currentTreasury -= techTheftAction.cost;
      return {
        actions,
        remainingTreasury: Math.max(0, currentTreasury),
      };
    }

    return {
      actions,
      remainingTreasury: currentTreasury,
    };
  }

  private static planSabotageTier2(
    nation: Nation,
    allNations: Record<string, Nation>,
    provincesMap: Record<string, Province> | undefined,
    currentTreasury: number,
    executedTiers: number[],
  ): { action: GameAction; cost: number } | null {
    if (executedTiers.includes(2)) {
      return null;
    }

    const activeWarTarget = nation.warFocusTargetId
      ? allNations[
          CountryRegistry.resolveCanonicalId(nation.warFocusTargetId)
        ] || allNations[nation.warFocusTargetId]
      : null;

    if (activeWarTarget && activeWarTarget.isAlive) {
      const targetGdp = getNationGdp(activeWarTarget, provincesMap);
      const cost = EspionageCalculator.calculateOperationCost(
        targetGdp,
        2,
        nation,
      );

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

    for (const [targetId, rel] of Object.entries(nation.relations || {})) {
      const canonicalTarget = CountryRegistry.resolveCanonicalId(targetId);
      const target = allNations[canonicalTarget] || allNations[targetId];

      if (!target || !target.isAlive || target.id === nation.id) {
        continue;
      }

      if (rel.stance === "WAR") {
        const targetGdp = getNationGdp(target, provincesMap);
        const cost = EspionageCalculator.calculateOperationCost(
          targetGdp,
          2,
          nation,
        );

        if (currentTreasury < Math.floor(cost * 1.2)) {
          continue;
        }

        const evalResult = AIThreatCalculator.evaluate(
          nation,
          target,
          provincesMap,
        );
        const grudge = rel.grudge ?? 0;
        const hasDefenses =
          (target.military.airDefense || 0) > 0 ||
          (target.military.armor || 0) > 0 ||
          target.military.airForce > 0;

        const isPreStrikeValid = nation.military.infantry > 1 && hasDefenses;
        const isAsymmetricValid =
          evalResult.powerRatio > 1.5 && grudge >= 40 && hasDefenses;

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

  private static planTechHeistTier3(
    nation: Nation,
    allNations: Record<string, Nation>,
    provincesMap: Record<string, Province> | undefined,
    currentTreasury: number,
    executedTiers: number[],
    rankMap?: Map<string, number>,
  ): { action: GameAction; cost: number } | null {
    if (executedTiers.includes(3)) {
      return null;
    }

    const reachableTargets = GeopoliticalReachResolver.getReachableTargets(
      nation,
      allNations,
      provincesMap,
      rankMap,
    );

    const eligibleTargets: { target: Nation; cost: number; points: number }[] =
      [];

    for (const target of reachableTargets) {
      const canonicalTarget = CountryRegistry.resolveCanonicalId(target.id);
      const rel =
        nation.relations[canonicalTarget] || nation.relations[target.id];

      if (rel && rel.stance === "ALLIANCE") {
        continue;
      }

      const superiority = EspionageCalculator.calculateTechSuperiority(
        nation,
        target,
        provincesMap,
      );

      if (superiority.totalAvailablePoints < 2) {
        continue;
      }

      const targetGdp = getNationGdp(target, provincesMap);
      const cost = EspionageCalculator.calculateOperationCost(
        targetGdp,
        3,
        nation,
      );

      if (currentTreasury >= Math.floor(cost * 1.3)) {
        eligibleTargets.push({
          target,
          cost,
          points: superiority.totalAvailablePoints,
        });
      }
    }

    if (eligibleTargets.length === 0) {
      return null;
    }

    eligibleTargets.sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      return a.cost - b.cost;
    });

    const chosen = eligibleTargets[0]!;

    return {
      action: ActionFactory.executeEspionage(nation.id, chosen.target.id, 3),
      cost: chosen.cost,
    };
  }
}
