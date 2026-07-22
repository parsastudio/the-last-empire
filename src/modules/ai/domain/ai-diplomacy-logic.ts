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

      if (
        relation.opinion < -50 &&
        relation.stance !== "WAR" &&
        personality === "AGGRESSIVE"
      ) {
        const ownPower =
          nation.military.infantry + nation.military.airForce * 3;
        const enemyPower =
          target.military.infantry + target.military.airForce * 3;

        if (ownPower > enemyPower * 1.5) {
          actions.push({
            id: `ai-war-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            nationId: nation.id,
            type: "DECLARE_WAR",
            targetNationId: targetId,
          });
          break;
        }
      }

      if (
        relation.opinion > 10 &&
        relation.opinion < 80 &&
        nation.treasury > 20000
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
}
