import type { GameState } from "@/domain/game/game-state.schema";

export class ThreatCalculator {
  public calculateGlobalThreat(state: GameState): number {
    let totalThreat = 0;
    const aliveNations = Object.values(state.nations).filter((n) => n.isAlive);

    for (const nation of aliveNations) {
      const aggressiveStances = Object.values(nation.relations).filter(
        (r) => r.stance === "WAR",
      ).length;

      const militaryPower =
        nation.military.infantry * 1.0 +
        nation.military.airForce * 3.0 +
        nation.military.droneMissile * 2.5;

      if (aggressiveStances > 0) {
        totalThreat += Math.floor(
          militaryPower * 0.05 * aggressiveStances +
            nation.globalAggression * 0.2,
        );
      }
    }

    return Math.min(100, totalThreat);
  }
}
