import { GameAction, ActionResult } from "@/domain/game/action.schema";
import { GameState } from "@/domain/game/game-state.schema";
import { ClientStorageService } from "@/infrastructure/storage/client-storage.service";

export class ActionDispatcherService {
  private storageService = new ClientStorageService();

  public async dispatch(
    action: GameAction,
    gameId?: string,
    currentState?: GameState | null,
  ): Promise<ActionResult> {
    const activeGameId = gameId || currentState?.gameId || "default_game";

    let effectiveState = currentState || null;
    if (!effectiveState) {
      effectiveState = await this.storageService.loadGameState(activeGameId);
    }

    try {
      const query = activeGameId ? `?gameId=${activeGameId}` : "";
      const response = await fetch(`/api/game/action${query}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, state: effectiveState }),
      });

      const json = (await response.json()) as {
        success: boolean;
        message?: string;
        error?: string;
        data?: ActionResult;
      };

      if (json.success) {
        const finalState = json.data?.newState || effectiveState;
        if (finalState) {
          await this.storageService.saveGameState(activeGameId, finalState);
        }

        return {
          success: true,
          actionId: action.id,
          message: json.message || "دستور با موفقیت ثبت گردید.",
          newState: finalState || undefined,
        };
      }

      return {
        success: false,
        actionId: action.id,
        message: json.message || "خطا در اجرای دستور",
        error: json.error || "EXECUTION_FAILED",
      };
    } catch {
      return {
        success: effectiveState !== null,
        actionId: action.id,
        message:
          effectiveState !== null
            ? "دستور در حالت آفلاین ثبت شد."
            : "ارتباط با سرور برقرار نشد.",
        newState: effectiveState || undefined,
      };
    }
  }
}
