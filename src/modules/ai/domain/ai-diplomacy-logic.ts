import type { Nation } from "@/modules/nation/schemas/nation.schema";
import type { GameAction } from "@/modules/game-engine/schemas/action.schema";

export class AIDiplomacyLogic {
  public planDiplomacy(
    nation: Nation,
    allNations: Record<string, Nation>,
    personality: string,
  ): GameAction[] {
    const actions: GameAction[] = [];
    for (const [targetId, relation] of Object.entries(nation.relations)) {
      const target = allNations[targetId];
      if (!target || !target.isAlive) {
        continue;
      }
      if (relation.stance === "COALITION") {
        const targetRelations = target.relations;
        for (const [allyId, allyRelation] of Object.entries(targetRelations)) {
          if (allyRelation.stance === "WAR" && allyId !== nation.id) {
            const allyNation = allNations[allyId];
            if (allyNation && allyNation.isAlive) {
              const ownRelationToAlly = nation.relations[allyId];
              if (
                ownRelationToAlly &&
                ownRelationToAlly.stance === "COALITION"
              ) {
                actions.push({
                  id: `ai-coalition-war-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                  nationId: nation.id,
                  type: "DECLARE_WAR",
                  targetNationId: targetId,
                });
                break;
              }
            }
          }
        }
      }
      const ownPower = this.calculatePower(nation);
      const targetPower = this.calculatePower(target);
      const relativePower = ownPower / (targetPower || 1);

      const isNeighbor =
        nation.geography.landNeighbors.includes(targetId) ||
        nation.geography.seaNeighbors.includes(targetId);
      if (!isNeighbor && nation.treasury < 300000) {
        continue;
      }

      if (
        personality === "AGGRESSIVE" &&
        relation.trust < -2 &&
        relation.stance !== "WAR" &&
        relativePower >= 2.0
      ) {
        actions.push({
          id: `ai-backstab-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          nationId: nation.id,
          type: "DECLARE_WAR",
          targetNationId: targetId,
        });
        break;
      }
      if (
        relation.opinion > 10 &&
        relation.opinion < 80 &&
        nation.treasury > 20000 &&
        relation.stance !== "WAR"
      ) {
        actions.push({
          id: `ai-diplomacy-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          nationId: nation.id,
          type: "DIPLOMATIC_PROPOSAL",
          targetNationId: targetId,
          proposalType:
            relation.stance === "PEACE"
              ? "NON_AGGRESSION_PACT"
              : "DEFENSIVE_PACT",
        });
      }
    }
    return actions;
  }

  private calculatePower(nation: Nation): number {
    return (
      nation.military.infantry * 1.0 +
      nation.military.airForce * 3.0 +
      nation.military.navy * 2.0 +
      nation.military.droneMissile * 2.5
    );
  }
}
