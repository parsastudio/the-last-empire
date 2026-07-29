import type { GameState } from "@/domain/game/game-state.schema";
import { CorruptionManager } from "@/engine/politics/corruption-manager";
import { TurnPhase, PipelineContext } from "@/engine/pipeline/turn-phase";
import { StabilityDoctrinesHandler } from "./politics/stability-doctrines-handler";
import { ElectionCrisisHandler } from "./politics/election-crisis-handler";

export class PoliticsPhase implements TurnPhase {
  private corruptionManager = new CorruptionManager();
  private stabilityDoctrinesHandler = new StabilityDoctrinesHandler();
  private electionCrisisHandler = new ElectionCrisisHandler();

  public execute(context: PipelineContext): GameState {
    const nextState = { ...context.state };
    const nations = { ...nextState.nations };

    for (const [id, nation] of Object.entries(nations)) {
      if (!nation.isAlive) {
        continue;
      }

      let updated = {
        ...nation,
        government: {
          ...nation.government,
        },
      };

      updated.government.corruption =
        this.corruptionManager.updateCorruptionLevel(updated);

      updated = this.stabilityDoctrinesHandler.handle(updated);

      const crisisResult = this.electionCrisisHandler.handle(
        updated,
        nextState.currentTurn,
        context.prng.nextInt(1, 1000000),
      );
      updated = crisisResult.updatedNation;

      updated.government = {
        ...updated.government,
        turnsInPower: updated.government.turnsInPower + 1,
      };

      nations[id] = updated;
    }

    nextState.nations = nations;
    return nextState;
  }
}
