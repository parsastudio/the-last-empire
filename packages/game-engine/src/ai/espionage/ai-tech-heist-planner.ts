import { GameAction } from "@/domain/game/action.schema";
import { ActionFactory } from "@/domain/game/action-factory";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { EspionageCalculator } from "@/engine/espionage/espionage-calculator";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { CountryRegistry } from "@/domain/data/countries";
import { GeopoliticalReachResolver } from "@/domain/diplomacy/geopolitical-reach-resolver.utility";

export class AITechHeistPlanner {
  public static planTechHeistTier3(
    nation: Nation,
    allNations: Record<string, Nation>,
    provincesMap: Record<string, Province> | undefined,
    currentTreasury: number,
    executedTiers: string[],
    rankMap?: Map<string, number>,
    reachableTargets?: Nation[],
    provincesByOwnerMap?: Map<string, Province[]>,
  ): { action: GameAction; cost: number } | null {
    const targets =
      reachableTargets ??
      GeopoliticalReachResolver.getReachableTargets(
        nation,
        allNations,
        provincesMap,
        rankMap,
        undefined,
        provincesByOwnerMap,
      );

    const eligibleTargets: { target: Nation; cost: number; points: number }[] =
      [];

    for (let i = 0; i < targets.length; i++) {
      const target = targets[i]!;
      const canonicalTarget = CountryRegistry.resolveCanonicalId(target.id);
      if (executedTiers.includes(`${canonicalTarget}:3`)) {
        continue;
      }

      const rel =
        nation.relations[canonicalTarget] || nation.relations[target.id];

      if (rel && rel.stance === "STRATEGIC_PARTNERSHIP") {
        continue;
      }

      const superiority = EspionageCalculator.calculateTechSuperiority(
        nation,
        target,
      );

      if (
        superiority.totalAvailablePoints <
        EspionageCalculator.MIN_TECH_DELTA_FOR_HEIST
      ) {
        continue;
      }

      const successRate = EspionageCalculator.calculateSuccessRate(
        3,
        nation,
        target,
      );

      if (successRate < 0.4) {
        continue;
      }

      const targetGdp = getNationGdp(
        target,
        provincesMap,
        undefined,
        provincesByOwnerMap,
      );
      const cost = EspionageCalculator.calculateOperationCost(targetGdp, 3);

      if (currentTreasury >= cost) {
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
