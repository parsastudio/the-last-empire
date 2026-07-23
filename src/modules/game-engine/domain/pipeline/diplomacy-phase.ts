import type { GameState } from "@/modules/game-engine/schemas/game-state.schema";
import { CoalitionManager } from "@/modules/diplomacy/domain/coalition-manager";
import { TrustManager } from "@/modules/diplomacy/domain/trust-manager";
import { TurnPhase, PipelineContext } from "./turn-phase";

export class DiplomacyPhase implements TurnPhase {
  private coalitionManager = new CoalitionManager();
  private trustManager = new TrustManager();

  public execute(context: PipelineContext): GameState {
    const nextState = this.coalitionManager.processCoalitions(context.state);
    const nations = { ...nextState.nations };

    for (const [id, nation] of Object.entries(nations)) {
      if (!nation.isAlive) {
        continue;
      }
      const updatedRelations = { ...nation.relations };
      for (const [targetId, relation] of Object.entries(updatedRelations)) {
        const target = nations[targetId];
        if (target && target.isAlive) {
          const baseRelation = this.trustManager.updateTrustAndTension(
            nation,
            target,
            relation,
          );

          let calculatedIntel = 0;
          const isLandNeighbor =
            nation.geography.landNeighbors.includes(targetId);

          if (
            baseRelation.stance === "ALLIANCE" ||
            isLandNeighbor ||
            baseRelation.militaryAccess
          ) {
            calculatedIntel = 3;
          } else if (
            baseRelation.stance === "PEACE" ||
            baseRelation.stance === "NON_AGGRESSION_PACT" ||
            baseRelation.stance === "DEFENSIVE_PACT"
          ) {
            calculatedIntel = 2;
          } else if (
            baseRelation.stance === "WAR" ||
            baseRelation.stance === "EMBARGO" ||
            baseRelation.stance === "COALITION"
          ) {
            calculatedIntel = 1;
          }

          updatedRelations[targetId] = {
            ...baseRelation,
            intelLevel: calculatedIntel,
          };
        }
      }
      nations[id] = {
        ...nation,
        relations: updatedRelations,
      };
    }

    nextState.nations = nations;
    return nextState;
  }
}
