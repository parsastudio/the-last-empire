import { GameState } from "@/domain/game/game-state.schema";

export class GameStateApiService {
  public async fetchStatus(
    nationId: string,
    gameId?: string,
  ): Promise<{ success: boolean; data?: GameState; error?: string }> {
    try {
      const query = gameId ? `&gameId=${gameId}` : "";
      const res = await fetch(`/api/game/status?nationId=${nationId}${query}`);
      const json = (await res.json()) as {
        success: boolean;
        data?: GameState;
        error?: string;
      };
      return json;
    } catch {
      return { success: false, error: "خطای ارتباط با سرور" };
    }
  }

  public async advanceTurn(
    gameId?: string,
    currentState?: GameState | null,
  ): Promise<{ success: boolean; data?: GameState; error?: string }> {
    try {
      const query = gameId ? `?gameId=${gameId}` : "";
      const res = await fetch(`/api/game/next-turn${query}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: currentState }),
      });
      const json = (await res.json()) as {
        success: boolean;
        data?: GameState;
        error?: string;
      };
      return json;
    } catch {
      return { success: false, error: "خطای شبکه در پیشبرد نوبت" };
    }
  }

  public async syncState(state: GameState): Promise<boolean> {
    try {
      const res = await fetch("/api/game/sync-state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state }),
      });
      const json = (await res.json()) as { success: boolean };
      return json.success;
    } catch {
      return false;
    }
  }

  public async selectCountry(
    nationId: string,
    governmentType: string,
    gameId: string,
  ): Promise<{ success: boolean; data?: GameState; error?: string }> {
    try {
      const res = await fetch("/api/game/select-country", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nationId,
          governmentType,
          gameId,
        }),
      });
      const json = (await res.json()) as {
        success: boolean;
        data?: GameState;
        error?: string;
      };
      return json;
    } catch {
      return { success: false, error: "خطا در راه‌اندازی کمپین جدید" };
    }
  }
}
