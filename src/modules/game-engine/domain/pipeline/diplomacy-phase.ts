import type { GameState } from "@/modules/game-engine/schemas/game-state.schema";
import { CoalitionManager } from "@/modules/diplomacy/domain/coalition-manager";
import { TrustManager } from "@/modules/diplomacy/domain/trust-manager";
import { TurnPhase, PipelineContext } from "./turn-phase";

export class DiplomacyPhase implements TurnPhase {
  private coalitionManager = new CoalitionManager();
  private trustManager = new TrustManager();

  public execute(context: PipelineContext): GameState {
    let nextState = this.coalitionManager.processCoalitions(context.state);
    const nations = { ...nextState.nations };

    for (const [id, nation] of Object.entries(nations)) {
      if (!nation.isAlive) {
        continue;
      }
      const updatedRelations = { ...nation.relations };
      for (const [targetId, relation] of Object.entries(updatedRelations)) {
        const target = nations[targetId];
        if (target && target.isAlive) {
          updatedRelations[targetId] = this.trustManager.updateTrustAndTension(
            nation,
            target,
            relation,
          );
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
