import { GameAction, ActionResult } from "@/domain/game/action.schema";
import { GameState } from "@/domain/game/game-state.schema";
import { GridState } from "@/engine/combat/state/grid-state";
import { GameActionQueue } from "./game-action.queue";
import { StateValidator } from "@/engine/validation/state-validator";
import { ActionRouter } from "@/engine/actions/action-router";

export class GameEngineDispatcher {
  private validator = new StateValidator();
  private router = new ActionRouter();

  public dispatch(
    currentState: GameState,
    _actionQueue: GameActionQueue,
    gridState: GridState,
    action: GameAction,
  ): ActionResult {
    if (currentState.isGameOver) {
      return {
        success: false,
        actionId: action.id,
        message: "Action rejected: Game is already over",
        error: "GAME_OVER",
      };
    }

    try {
      const stateWithGrid = { ...currentState, gridState };
      this.validator.validateAction(stateWithGrid, action);
      const routedState = this.router.route(stateWithGrid, action);
      const cleanedState: GameState & { gridState?: unknown } = {
        ...routedState,
      };
      delete cleanedState.gridState;

      Object.assign(currentState, cleanedState);

      return {
        success: true,
        actionId: action.id,
        message: "Action executed instantly",
        newState: currentState,
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown action error";
      return {
        success: false,
        actionId: action.id,
        message: errorMessage,
        error: "INVALID_ACTION",
      };
    }
  }
}
