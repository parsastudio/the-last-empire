import type { GameState } from "@/modules/game-engine/schemas/game-state.schema";
import { NationManager } from "@/modules/nation/domain/nation-manager";

export class ThreatCalculator {
  private nationManager = new NationManager();

  public calculateGlobalThreat(state: GameState): number {
    let totalThreat = 0;

    for (const nation of Object.values(state.nations)) {
      if (!nation.isAlive) {
        continue;
      }

      const aggressiveStances = Object.values(nation.relations).filter(
        (r) => r.stance === "WAR",
      ).length;

      const militaryPower = this.nationManager.getTotalMilitaryPower(nation);

      if (aggressiveStances > 0) {
        totalThreat += Math.floor(militaryPower * 0.05 * aggressiveStances);
      }
    }

    return Math.min(100, totalThreat);
  }
}
