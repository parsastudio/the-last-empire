import type { GameAction, ActionResult } from "@/core/types/actions.types";
import type { GameState } from "@/core/types/game-state.types";
import { deepClone } from "@/core/utils/deep-clone";
import { SeededRandom } from "@/core/math/seeded-random";
import { GameError } from "@/core/errors/game-error";
import { ActionQueue } from "./action-queue";
import { EventLogger } from "./event-logger";
import { NationLivenessManager } from "./nation-liveness-manager";
import { VictoryChecker } from "./victory-checker";
import { StateHistory } from "./state-history";

export class GameEngine {
  private currentState: GameState;
  private actionQueue: ActionQueue;
  private eventLogger: EventLogger;
  private livenessManager: NationLivenessManager;
  private victoryChecker: VictoryChecker;
  private stateHistory: StateHistory;
  private prng: SeededRandom;

  constructor(initialState: GameState) {
    this.currentState = deepClone(initialState);
    this.actionQueue = new ActionQueue();
    this.eventLogger = new EventLogger();
    this.livenessManager = new NationLivenessManager();
    this.victoryChecker = new VictoryChecker();
    this.stateHistory = new StateHistory();
    this.prng = new SeededRandom(initialState.seed);
    this.stateHistory.saveSnapshot(this.currentState);
  }

  public getState(): Readonly<GameState> {
    return Object.freeze(deepClone(this.currentState));
  }

  public dispatchAction(action: GameAction): ActionResult {
    if (this.currentState.isGameOver) {
      return {
        success: false,
        actionId: action.id,
        message: "Action rejected: Game is already over",
        error: "STATE_FROZEN",
      };
    }

    try {
      this.actionQueue.enqueue(this.currentState, action);
      return {
        success: true,
        actionId: action.id,
        message: "Action enqueued successfully",
      };
    } catch (err) {
      const errorMessage =
        err instanceof GameError ? err.message : "Unknown action error";
      const errorCode = err instanceof GameError ? err.code : "INVALID_ACTION";
      return {
        success: false,
        actionId: action.id,
        message: errorMessage,
        error: errorCode,
      };
    }
  }

  public nextTurn(): GameState {
    if (this.currentState.isGameOver) {
      return this.getState();
    }

    this.processActionQueue();
    this.currentState = this.livenessManager.updateLiveness(this.currentState);

    const victoryStatus = this.victoryChecker.checkVictory(this.currentState);
    if (victoryStatus.isGameOver) {
      this.currentState = {
        ...this.currentState,
        isGameOver: true,
        winnerNationId: victoryStatus.winnerNationId,
      };
    }

    this.currentState = {
      ...this.currentState,
      currentTurn: this.currentState.currentTurn + 1,
      seed: this.prng.getSeed(),
    };

    this.actionQueue.clear();
    this.stateHistory.saveSnapshot(this.currentState);

    return this.getState();
  }

  public getTurnHistory(turnNumber: number): GameState | undefined {
    return this.stateHistory.getTurnHistory(turnNumber);
  }

  private processActionQueue(): void {
    const actions = this.actionQueue.getQueue();
    for (const action of actions) {
      const logEntry = this.eventLogger.createEntry(
        this.currentState.currentTurn,
        action.nationId,
        "INFO",
        `Action processed: ${action.type}`,
      );
      this.currentState.turnLogs.push(logEntry);
    }
  }
}
