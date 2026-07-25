import { GameAction, ActionResult } from "@/domain/game/action.schema";
import { GameState } from "@/domain/game/game-state.schema";
import { deepClone } from "@/domain/shared/deep-clone";
import { SeededRandom } from "@/domain/shared/seeded-random";
import { GameError } from "@/domain/shared/game-error";
import { ActionQueue } from "@/engine/action-queue";
import { EventLogger } from "@/engine/event-logger";
import { NationLivenessManager } from "@/engine/politics/nation-liveness-manager";
import { VictoryChecker } from "@/engine/politics/victory-checker";
import { StateHistory } from "@/application/state-history";
import { AIEngine } from "@/engine/ai/ai-engine";
import { ActionRouter } from "@/engine/actions/action-router";
import { GridState } from "@/engine/combat/state/grid-state";
import { GridHistoryAdapter } from "@/engine/combat/history/grid-history-adapter";
import { ActionPrioritySorter } from "./orchestrator/action-priority-sorter";
import { PeaceTracker } from "./orchestrator/peace-tracker";
import { GridPostTurnCleanup } from "./orchestrator/grid-post-turn-cleanup";
import { TurnPhaseOrchestrator } from "./orchestrator/turn-phase-orchestrator";

export class GameEngine {
  private currentState: GameState;
  private actionQueue: ActionQueue;
  private eventLogger: EventLogger;
  private livenessManager: NationLivenessManager;
  private victoryChecker: VictoryChecker;
  private stateHistory: StateHistory;
  private aiEngine: AIEngine;
  private prng: SeededRandom;
  private actionRouter: ActionRouter;
  private gridState: GridState;
  private gridHistory = new GridHistoryAdapter();

  private prioritySorter = new ActionPrioritySorter();
  private peaceTracker = new PeaceTracker();
  private gridPostCleanup = new GridPostTurnCleanup();
  private turnOrchestrator = new TurnPhaseOrchestrator();

  constructor(initialState: GameState) {
    const rawGridState = (initialState as { gridState?: GridState }).gridState;
    const stateCopy: Omit<GameState, "gridState"> & { gridState?: unknown } = {
      ...initialState,
    };
    if ("gridState" in stateCopy) {
      delete stateCopy.gridState;
    }
    this.currentState = deepClone(stateCopy as GameState);
    this.actionQueue = new ActionQueue();
    this.eventLogger = new EventLogger();
    this.livenessManager = new NationLivenessManager();
    this.victoryChecker = new VictoryChecker();
    this.stateHistory = new StateHistory();
    this.aiEngine = new AIEngine();
    this.prng = new SeededRandom(initialState.seed);
    this.actionRouter = new ActionRouter();
    this.gridState = rawGridState || new GridState();
    this.stateHistory.saveSnapshot(this.currentState);
    this.gridHistory.captureTurn(
      this.stateHistory,
      this.currentState.currentTurn,
      this.gridState,
    );
  }

  public getState(): Readonly<GameState> {
    const cloned = deepClone(this.currentState);
    (cloned as { gridState?: GridState }).gridState = this.gridState;
    return Object.freeze(cloned);
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
      const stateWithGrid = { ...this.currentState, gridState: this.gridState };
      this.actionQueue.enqueue(stateWithGrid, action);
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

    const stateWithGrid = { ...this.currentState, gridState: this.gridState };
    const aiActions = this.aiEngine.generateTurnActions(stateWithGrid);
    for (const aiAction of aiActions) {
      try {
        this.actionQueue.enqueue(stateWithGrid, aiAction);
      } catch {
        continue;
      }
    }

    this.processActionQueue();

    this.currentState = this.turnOrchestrator.executePhases(
      this.currentState,
      this.prng,
    );
    this.currentState = this.gridPostCleanup.cleanupAndSynchronize(
      this.currentState,
      this.gridState,
    );
    this.currentState = this.livenessManager.updateLiveness(this.currentState);

    const peacefulCount = this.peaceTracker.updatePeacefulTurns(
      this.currentState,
    );
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
    this.gridHistory.captureTurn(
      this.stateHistory,
      this.currentState.currentTurn,
      this.gridState,
    );

    return this.getState();
  }

  public getTurnHistory(turnNumber: number): GameState | undefined {
    const state = this.stateHistory.getTurnHistory(turnNumber);
    if (state) {
      this.gridHistory.rollbackTurn(turnNumber, this.gridState);
      (state as { gridState?: GridState }).gridState = this.gridState;
    }
    return state;
  }

  private processActionQueue(): void {
    const rawQueue = this.actionQueue.getQueue();
    const sortedActions = this.prioritySorter.sortActions(rawQueue, this.prng);

    let state = this.currentState;

    for (const action of sortedActions) {
      try {
        const stateWithGrid: GameState & { gridState?: GridState } = {
          ...state,
          gridState: this.gridState,
        };
        const routedState = this.actionRouter.route(stateWithGrid, action);
        const cleanedRoutedState: GameState & { gridState?: unknown } = {
          ...routedState,
        };
        delete cleanedRoutedState.gridState;
        state = cleanedRoutedState as GameState;

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
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown execution error";
        const logEntry = this.eventLogger.createEntry(
          state.currentTurn,
          action.nationId,
          "CRITICAL",
          `Action failed during execution: ${action.type}. Reason: ${errorMessage}`,
        );
        state = {
          ...state,
          turnLogs: [...state.turnLogs, logEntry],
        };
      }
    }
    this.currentState = state;
  }
}
