import { GameAction, ActionResult } from "@/domain/game/action.schema";
import { GameState } from "@/domain/game/game-state.schema";
import { StateValidator } from "@/engine/validation/state-validator";
import { ActionRouter } from "@/engine/actions/action-router";

export class GameEngineDispatcher {
  private validator = new StateValidator();
  private router = new ActionRouter();

  public dispatch(currentState: GameState, action: GameAction): ActionResult {
    if (currentState.isGameOver) {
      return {
        success: false,
        actionId: action.id,
        message: "Action rejected: Game is already over",
        error: "GAME_OVER",
      };
    }

    try {
      this.validator.validateAction(currentState, action);
      const routedState = this.router.route(currentState, action);

      return {
        success: true,
        actionId: action.id,
        message: "Action executed instantly",
        newState: routedState,
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
