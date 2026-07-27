import { GameAction, ActionResult } from "@/domain/game/action.schema";
import { GameState } from "@/domain/game/game-state.schema";
import { GridState } from "@/engine/combat/state/grid-state";
import { GameActionQueue } from "./game-action.queue";

export class GameEngineDispatcher {
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
