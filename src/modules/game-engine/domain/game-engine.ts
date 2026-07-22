import type {
  GameAction,
  ActionResult,
} from "@/modules/game-engine/schemas/action.schema";
import type { GameState } from "@/modules/game-engine/schemas/game-state.schema";
import { deepClone } from "@/core/utils/deep-clone";
import { SeededRandom } from "@/core/math/seeded-random";
import { GameError } from "@/core/errors/game-error";
import { ActionQueue } from "./action-queue";
import { EventLogger } from "./event-logger";
import { NationLivenessManager } from "./nation-liveness-manager";
import { VictoryChecker } from "./victory-checker";
import { StateHistory } from "./state-history";
import { TurnPipeline } from "./turn-pipeline";
import { AIEngine } from "@/modules/ai/domain/ai-engine";
import { ActionRouter } from "./actions/action-router";

export class GameEngine {
  private currentState: GameState;
  private actionQueue: ActionQueue;
  private eventLogger: EventLogger;
  private livenessManager: NationLivenessManager;
  private victoryChecker: VictoryChecker;
  private stateHistory: StateHistory;
  private pipeline: TurnPipeline;
  private aiEngine: AIEngine;
  private prng: SeededRandom;
  private actionRouter: ActionRouter;

  constructor(initialState: GameState) {
    this.currentState = deepClone(initialState);
    this.actionQueue = new ActionQueue();
    this.eventLogger = new EventLogger();
    this.livenessManager = new NationLivenessManager();
    this.victoryChecker = new VictoryChecker();
    this.stateHistory = new StateHistory();
    this.pipeline = new TurnPipeline();
    this.aiEngine = new AIEngine();
    this.prng = new SeededRandom(initialState.seed);
    this.actionRouter = new ActionRouter();
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

    const aiActions = this.aiEngine.generateTurnActions(this.currentState);
    for (const aiAction of aiActions) {
      try {
        this.actionQueue.enqueue(this.currentState, aiAction);
      } catch {
        continue;
      }
    }

    this.processActionQueue();

    const activeWars = Object.values(this.currentState.nations).some((n) =>
      Object.values(n.relations).some((r) => r.stance === "WAR"),
    );

    this.currentState = this.pipeline.processTurn(this.currentState, this.prng);
    this.currentState = this.livenessManager.updateLiveness(this.currentState);

    let peacefulCount = this.currentState.peacefulTurnsCount ?? 0;
    if (!activeWars) {
      peacefulCount += 1;
    } else {
      peacefulCount = 0;
    }

    this.currentState = {
      ...this.currentState,
      peacefulTurnsCount: peacefulCount,
    };

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
    let state = this.currentState;
    for (const action of actions) {
      state = this.actionRouter.route(state, action);

      const logEntry = this.eventLogger.createEntry(
        state.currentTurn,
        action.nationId,
        "INFO",
        `Action processed: ${action.type}`,
      );

      state = {
        ...state,
        turnLogs: [...state.turnLogs, logEntry],
      };
    }
    this.currentState = state;
  }
}
