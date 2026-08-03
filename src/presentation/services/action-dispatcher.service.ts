import { GameAction, ActionResult } from "@/domain/game/action.schema";
import { GameState } from "@/domain/game/game-state.schema";
import { ClientStorageService } from "@/infrastructure/storage/client-storage.service";
import { ActionRouter } from "@/engine/actions/action-router";

export class ActionDispatcherService {
  private storageService = new ClientStorageService();
  private actionRouter = new ActionRouter();

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

    let optimisticState: GameState | null = null;
    if (effectiveState) {
      try {
        optimisticState = this.actionRouter.route(effectiveState, action);
        await this.storageService.saveGameState(
          activeGameId,
          optimisticState,
          action as unknown as Record<string, unknown>,
          effectiveState,
        );

        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("geopolitics-state-updated", {
              detail: optimisticState,
            }),
          );
        }
      } catch {}
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
        const finalState = json.data?.newState || optimisticState;
        if (finalState) {
          await this.storageService.saveGameState(
            activeGameId,
            finalState,
            action as unknown as Record<string, unknown>,
            effectiveState,
          );
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
        success: optimisticState !== null,
        actionId: action.id,
        message:
          optimisticState !== null
            ? "دستور در حالت آفلاین ثبت شد."
            : "ارتباط با سرور برقرار نشد.",
        newState: optimisticState || undefined,
      };
    }
  }
}
