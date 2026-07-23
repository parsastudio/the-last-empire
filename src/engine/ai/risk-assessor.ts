import type { Nation } from "@/domain/nation/nation.schema";
import { NationManager } from "@/engine/politics/nation-manager";

export class RiskAssessor {
  private nationManager = new NationManager();

  public assessRisk(
    nation: Nation,
    allNations: Record<string, Nation>,
  ): number {
    let threatLevel = 0;

    for (const [id, relation] of Object.entries(nation.relations)) {
      const target = allNations[id];
      if (!target || !target.isAlive) {
        continue;
      }

      if (relation.stance === "WAR") {
        const enemyPower = this.nationManager.getTotalMilitaryPower(target);
        const ownPower = this.nationManager.getTotalMilitaryPower(nation);

        const ratio = enemyPower / (ownPower || 1);
        threatLevel += ratio * 30;
      } else if (relation.opinion < -40) {
        threatLevel += 10;
      }
    }

    return Math.min(100, Math.max(0, threatLevel));
  }
}
