import type { Nation } from "@/domain/nation/nation.schema";

export class GlobalIntelligenceUpdater {
  public updatePassiveIntel(
    nation: Nation,
    allNations: Record<string, Nation>,
  ): Nation {
    const updatedRelations = { ...nation.relations };

    for (const [targetId, relation] of Object.entries(updatedRelations)) {
      const target = allNations[targetId];
      if (!target || !target.isAlive) {
        continue;
      }

      let intelLevel = 0;
      const isLandNeighbor = nation.geography.landNeighbors.includes(targetId);

      if (relation.stance === "ALLIANCE") {
        intelLevel = 2;
      } else if (isLandNeighbor || relation.stance === "NON_AGGRESSION_PACT") {
        intelLevel = 1;
      }

      updatedRelations[targetId] = {
        ...relation,
        intelLevel,
      };
    }

    return {
      ...nation,
      relations: updatedRelations,
    };
  }
}
