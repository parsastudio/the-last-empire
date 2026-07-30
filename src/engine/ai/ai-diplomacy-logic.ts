import type { Nation } from "@/domain/nation/nation.schema";
import type { GameAction } from "@/domain/game/action.schema";
import { DeterministicIdGenerator } from "./utils/deterministic-id-generator";

export class AIDiplomacyLogic {
  private idGenerator = new DeterministicIdGenerator();

  public planDiplomacy(
    nation: Nation,
    allNations: Record<string, Nation>,
    _personality: string,
    currentTurn = 1,
  ): GameAction[] {
    const actions: GameAction[] = [];
    let seq = 1;

    for (const [targetId, relation] of Object.entries(nation.relations)) {
      if (actions.length >= 2) {
        break;
      }

      const target = allNations[targetId];
      if (!target || !target.isAlive) {
        continue;
      }

      const isNeighbor =
        nation.geography.landNeighbors.includes(targetId) ||
        nation.geography.seaNeighbors.includes(targetId);
      if (!isNeighbor && nation.treasury < 300000) {
        continue;
      }

      if (
        relation.opinion > 10 &&
        relation.opinion < 80 &&
        nation.treasury > 20000
      ) {
        actions.push({
          id: this.idGenerator.generateActionId(
            "DIPLOMATIC_PROPOSAL",
            nation.id,
            currentTurn,
            seq++,
          ),
          nationId: nation.id,
          type: "DIPLOMATIC_PROPOSAL",
          targetNationId: targetId,
          proposalType:
            relation.stance === "PEACE"
              ? "NON_AGGRESSION_PACT"
              : "FULL_ALLIANCE",
        });
      }
    }
    return actions;
  }
}
