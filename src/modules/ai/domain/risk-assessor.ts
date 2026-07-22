import type { Nation } from "@/core/types";

export class RiskAssessor {
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
        const enemyPower =
          target.military.infantry +
          target.military.airForce * 3 +
          target.military.navy * 2 +
          target.military.droneMissile * 2.5;
        const ownPower =
          nation.military.infantry +
          nation.military.airForce * 3 +
          nation.military.navy * 2 +
          nation.military.droneMissile * 2.5;

        const ratio = enemyPower / (ownPower || 1);
        threatLevel += ratio * 30;
      } else if (relation.opinion < -40) {
        threatLevel += 10;
      }
    }

    return Math.min(100, Math.max(0, threatLevel));
  }
}
