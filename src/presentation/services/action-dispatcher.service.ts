import { GameAction, ActionResult } from "@/domain/game/action.schema";
import { GameState } from "@/domain/game/game-state.schema";
import { GameStorageAdapter } from "@/infrastructure/storage/game-storage.adapter";
import { ActionRouter } from "@/engine/actions/action-router";
import { StateValidator } from "@/engine/validation/state-validator";

const storageAdapter = new GameStorageAdapter();
const router = new ActionRouter();
const validator = new StateValidator();

export class ActionDispatcherService {
  public async dispatch(
    action: GameAction,
    gameId?: string,
    currentState?: GameState | null,
    persistToStorage = false,
  ): Promise<ActionResult> {
    const activeGameId = gameId || currentState?.gameId || "default_game";

    let effectiveState = currentState || null;
    if (!effectiveState) {
      effectiveState = await storageAdapter.loadGameState(activeGameId);
    }

    if (!effectiveState) {
      return {
        success: false,
        actionId: action.id,
        message: "اطلاعات پرونده بازی یافت نشد.",
        error: "STATE_NOT_FOUND",
      };
    }

    try {
      validator.validateAction(effectiveState, action);
      const newState = router.route(effectiveState, action);

      if (persistToStorage) {
        await storageAdapter.saveGameState(activeGameId, newState);
      }

      return {
        success: true,
        actionId: action.id,
        message: "دستور با موفقیت صادر گردید.",
        newState,
      };
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "خطا در اجرای دستور";
      return {
        success: false,
        actionId: action.id,
        message: errorMsg,
        error: "EXECUTION_FAILED",
      };
    }
  }
}
