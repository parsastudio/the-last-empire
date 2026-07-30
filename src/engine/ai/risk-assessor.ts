import type { Nation } from "@/domain/nation/nation.schema";

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

      if (relation.opinion < -40) {
        threatLevel += 10;
      }
    }

    return Math.min(100, Math.max(0, threatLevel));
  }
}
