import { GameAction, ActionResult } from "@/domain/game/action.schema";
import { GameState } from "@/domain/game/game-state.schema";
import { deepClone } from "@/domain/shared/deep-clone";
import { SeededRandom } from "@/domain/shared/seeded-random";
import { GameActionQueue } from "./orchestrator/game-action.queue";
import { TurnProgressionOrchestrator } from "./orchestrator/turn-progression.orchestrator";
import { HistoryManager } from "./orchestrator/history.manager";
import { GridState } from "@/engine/combat/state/grid-state";
import { GridStateProvider } from "@/engine/combat/state/grid-state-provider";
import { GameEngineDispatcher } from "./orchestrator/game-engine-dispatcher";

export class GameEngine {
  private currentState: GameState;
  private actionQueue = new GameActionQueue();
  private progressionOrchestrator = new TurnProgressionOrchestrator();
  private historyManager = new HistoryManager();
  private dispatcher = new GameEngineDispatcher();
  private prng: SeededRandom;
  private gridState: GridState;

  constructor(initialState: GameState) {
    this.currentState = deepClone(initialState);
    this.prng = new SeededRandom(initialState.seed);
    this.gridState = GridStateProvider.getInstance();
    this.historyManager.recordSnapshot(this.currentState, this.gridState);
  }

  public getState(): Readonly<GameState> {
    const cloned = deepClone(this.currentState);
    return Object.freeze(cloned);
  }

  public dispatchAction(action: GameAction): ActionResult {
    return this.dispatcher.dispatch(
      this.currentState,
      this.actionQueue,
      this.gridState,
      action,
    );
  }

  public nextTurn(): GameState {
    if (this.currentState.isGameOver) {
      return this.getState();
    }

    this.currentState = this.progressionOrchestrator.advanceTurn(
      this.currentState,
      this.gridState,
      this.prng,
      (state) =>
        this.actionQueue.processActions(state, this.gridState, this.prng),
    );

    this.historyManager.recordSnapshot(this.currentState, this.gridState);

    return this.getState();
  }

  public getTurnHistory(turnNumber: number): GameState | undefined {
    return this.historyManager.getTurnHistory(turnNumber, this.gridState);
  }
}
