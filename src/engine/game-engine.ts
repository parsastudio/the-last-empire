import { GameAction, ActionResult } from "@/domain/game/action.schema";
import { GameState } from "@/domain/game/game-state.schema";
import { deepClone, SeededRandom } from "@/domain/shared/domain-utilities";
import { GameActionQueue } from "@/engine/orchestrator/game-action.queue";
import { StateHistory } from "@/application/state-history";
import { GameEngineDispatcher } from "@/engine/orchestrator/game-engine-dispatcher";
import { TurnProgressionOrchestrator } from "@/engine/orchestrator/turn-progression.orchestrator";

export class GameEngine {
  private currentState: GameState;
  private actionQueue = new GameActionQueue();
  private stateHistory = new StateHistory();
  private dispatcher = new GameEngineDispatcher();
  private progressionOrchestrator = new TurnProgressionOrchestrator();
  private prng: SeededRandom;

  constructor(initialState: GameState) {
    this.currentState = deepClone(initialState);
    this.prng = new SeededRandom(initialState.seed);
    this.stateHistory.saveSnapshot(this.currentState);
  }

  public getState(): Readonly<GameState> {
    const cloned = deepClone(this.currentState);
    return Object.freeze(cloned);
  }

  public dispatchAction(action: GameAction): ActionResult {
    const result = this.dispatcher.dispatch(this.currentState, action);
    if (result.success && result.newState) {
      this.currentState = deepClone(result.newState);
    }
    return result;
  }

  public nextTurn(): GameState {
    if (this.currentState.isGameOver) {
      return this.getState();
    }

    this.currentState = this.progressionOrchestrator.advanceTurn(
      this.currentState,
      this.prng,
      (state, additionalActions) => {
        if (additionalActions) {
          for (const action of additionalActions) {
            this.actionQueue.enqueue(state, action);
          }
        }
        return this.actionQueue.processActions(state, this.prng);
      },
    );

    this.stateHistory.saveSnapshot(this.currentState);

    return this.getState();
  }

  public getTurnHistory(turnNumber: number): GameState | undefined {
    return this.stateHistory.getTurnHistory(turnNumber);
  }
}
