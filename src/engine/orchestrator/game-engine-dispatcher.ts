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
    actionQueue: GameActionQueue,
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
      if (action.type === "TRADE_RESOURCES") {
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
          message: "Transaction executed instantly",
          newState: currentState,
        };
      }

      actionQueue.enqueue(currentState, gridState, action);
      return {
        success: true,
        actionId: action.id,
        message: "Action enqueued successfully",
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
