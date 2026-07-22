import type { GameState } from "@/core/types";

export class ThreatCalculator {
  public calculateGlobalThreat(state: GameState): number {
    let totalThreat = 0;

    for (const nation of Object.values(state.nations)) {
      if (!nation.isAlive) {
        continue;
      }

      const aggressiveStances = Object.values(nation.relations).filter(
        (r) => r.stance === "WAR",
      ).length;

      const militaryPower =
        nation.military.infantry +
        nation.military.airForce * 3 +
        nation.military.navy * 2 +
        nation.military.droneMissile * 2.5;

      if (aggressiveStances > 0) {
        totalThreat += Math.floor(militaryPower * 0.05 * aggressiveStances);
      }
    }

    return Math.min(100, totalThreat);
  }
}
