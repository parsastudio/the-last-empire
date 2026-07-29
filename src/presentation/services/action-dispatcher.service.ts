import { GameAction, ActionResult } from "@/domain/game/action.schema";
import { GameState } from "@/domain/game/game-state.schema";

export class ActionDispatcherService {
  public async dispatch(
    action: GameAction,
    gameId?: string,
    currentState?: GameState | null,
  ): Promise<ActionResult> {
    try {
      const query = gameId ? `?gameId=${gameId}` : "";
      const response = await fetch(`/api/game/action${query}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, state: currentState }),
      });

      const json = (await response.json()) as {
        success: boolean;
        message?: string;
        error?: string;
        data?: ActionResult;
      };

      if (json.success) {
        return {
          success: true,
          actionId: action.id,
          message: json.message || "دستور با موفقیت ثبت گردید.",
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
        success: false,
        actionId: action.id,
        message: "ارتباط با سرور برقرار نشد.",
        error: "NETWORK_ERROR",
      };
    }
  }
}
