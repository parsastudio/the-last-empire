import { GameState } from "@/domain/game/game-state.schema";
import { GameStorageAdapter } from "@/infrastructure/storage/game-storage.adapter";

export class ClientStorageService {
  private storageAdapter = new GameStorageAdapter();

  public async saveGameState(gameId: string, state: GameState): Promise<void> {
    if (typeof window === "undefined") return;
    try {
      await this.storageAdapter.saveGameState(gameId, state);
    } catch {}
  }

  public async loadGameState(gameId: string): Promise<GameState | null> {
    if (typeof window === "undefined") return null;
    try {
      return await this.storageAdapter.loadGameState(gameId);
    } catch {
      return null;
    }
  }

  public async removeGameState(gameId: string): Promise<void> {
    if (typeof window === "undefined") return;
    try {
      await this.storageAdapter.deleteState(gameId);
    } catch {}
  }
}
