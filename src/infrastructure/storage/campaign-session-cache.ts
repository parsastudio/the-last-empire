import { GameState } from "@/domain/game/game-state.schema";

export class CampaignSessionCache {
  private static cache = new Map<string, GameState>();

  public static set(gameId: string, state: GameState): void {
    this.cache.set(gameId, state);
  }

  public static get(gameId: string): GameState | null {
    return this.cache.get(gameId) || null;
  }

  public static has(gameId: string): boolean {
    return this.cache.has(gameId);
  }

  public static remove(gameId: string): void {
    this.cache.delete(gameId);
  }

  public static clear(): void {
    this.cache.clear();
  }
}
