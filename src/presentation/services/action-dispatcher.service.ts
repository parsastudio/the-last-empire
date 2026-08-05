import { GameAction, ActionResult } from "@/domain/game/action.schema";
import { GameState } from "@/domain/game/game-state.schema";
import { ClientStorageService } from "@/infrastructure/storage/client-storage.service";
import { ActionRouter } from "@/engine/actions/action-router";
import { StateValidator } from "@/engine/validation/state-validator";
import { AsyncSaveQueueService } from "@/infrastructure/storage/async-save-queue.service";
import { CampaignSessionCache } from "@/infrastructure/storage/campaign-session-cache";

export class ActionDispatcherService {
  private storageService = new ClientStorageService();
  private router = new ActionRouter();
  private validator = new StateValidator();
  private saveQueue = AsyncSaveQueueService.getInstance();

  public async dispatch(
    action: GameAction,
    gameId?: string,
    currentState?: GameState | null,
  ): Promise<ActionResult> {
    const activeGameId = gameId || currentState?.gameId || "default_game";

    let effectiveState = currentState || null;
    if (!effectiveState) {
      effectiveState = CampaignSessionCache.get(activeGameId);
    }
    if (!effectiveState) {
      effectiveState = await this.storageService.loadGameState(activeGameId);
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
      this.validator.validateAction(effectiveState, action);
      const newState = this.router.route(effectiveState, action);

      CampaignSessionCache.set(activeGameId, newState);
      this.saveQueue.enqueueSave(activeGameId, newState, false);

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
