import { GameState } from "@/domain/game/game-state.schema";
import { TurnPipeline } from "@/engine/turn-pipeline";
import { NationLivenessManager } from "@/engine/politics/nation-liveness-manager";
import { VictoryChecker } from "@/engine/politics/victory-checker";
import { SeededRandom } from "@/domain/shared/domain-utilities";
import { ActionEngine } from "@/engine/actions/action-engine";
import { AIActionBuilder } from "@/engine/ai/ai-action-builder";
import { DiplomacyLockManager } from "@/domain/diplomacy/nation-relation-resolver.utility";

export class TurnProgressionOrchestrator {
  private pipeline = new TurnPipeline();
  private livenessManager = new NationLivenessManager();
  private victoryChecker = new VictoryChecker();

  public advanceTurn(state: GameState, prng: SeededRandom): GameState {
    let nextState = state;
    const lockedDiplomacyTargets = new Set<string>();
    const sortedNationIds = Object.keys(nextState.nations).sort();

    for (const id of sortedNationIds) {
      const nation = nextState.nations[id];
      if (!nation || !nation.isAlive || !nation.isAi) {
        continue;
      }

      const aiActions = AIActionBuilder.buildNationActions(
        nation,
        nextState.nations,
        nextState.provinces,
        lockedDiplomacyTargets,
      );

      for (const action of aiActions) {
        const result = ActionEngine.execute(nextState, action);
        if (result.success && result.newState) {
          nextState = result.newState;

          if (
            action.type === "DIPLOMATIC_PROPOSAL" &&
            "targetNationId" in action &&
            action.targetNationId
          ) {
            lockedDiplomacyTargets.add(
              DiplomacyLockManager.createKey(
                action.nationId,
                action.targetNationId,
              ),
            );
            lockedDiplomacyTargets.add(
              DiplomacyLockManager.createKey(
                action.targetNationId,
                action.nationId,
              ),
            );
          }
        }
      }
    }

    nextState = this.pipeline.processTurn(nextState);
    nextState = this.livenessManager.updateLiveness(nextState);

    const victoryStatus = this.victoryChecker.checkVictory(nextState);
    if (victoryStatus.isGameOver) {
      nextState = {
        ...nextState,
        isGameOver: true,
        winnerNationId: victoryStatus.winnerNationId,
        gameOverReason: victoryStatus.reason,
      };
    }

    return {
      ...nextState,
      currentTurn: nextState.currentTurn + 1,
      seed: prng.getSeed(),
    };
  }
}
