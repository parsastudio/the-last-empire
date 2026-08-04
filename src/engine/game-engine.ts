import { GameAction, ActionResult } from "@/domain/game/action.schema";
import { GameState } from "@/domain/game/game-state.schema";
import { deepClone, SeededRandom } from "@/domain/shared/domain-utilities";
import { StateHistory } from "@/application/state-history";
import { StateValidator } from "@/engine/validation/state-validator";
import { ActionRouter } from "@/engine/actions/action-router";
import { TurnProgressionOrchestrator } from "@/engine/orchestrator/turn-progression.orchestrator";

export class GameEngine {
  private currentState: GameState;
  private stateHistory = new StateHistory();
  private validator = new StateValidator();
  private router = new ActionRouter();
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
    if (this.currentState.isGameOver) {
      return {
        success: false,
        actionId: action.id,
        message: "دستور رد شد: بازی به پایان رسیده است.",
        error: "GAME_OVER",
      };
    }

    try {
      this.validator.validateAction(this.currentState, action);
      const routedState = this.router.route(this.currentState, action);
      this.currentState = deepClone(routedState);

      return {
        success: true,
        actionId: action.id,
        message: "دستور با موفقیت صادر شد.",
        newState: this.currentState,
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "خطا در اجرای دستور";
      return {
        success: false,
        actionId: action.id,
        message: errorMessage,
        error: "INVALID_ACTION",
      };
    }
  }

  public nextTurn(): GameState {
    if (this.currentState.isGameOver) {
      return this.getState();
    }

    this.currentState = this.progressionOrchestrator.advanceTurn(
      this.currentState,
      this.prng,
    );

    this.stateHistory.saveSnapshot(this.currentState);

    return this.getState();
  }

  public getTurnHistory(turnNumber: number): GameState | undefined {
    return this.stateHistory.getTurnHistory(turnNumber);
  }
}
