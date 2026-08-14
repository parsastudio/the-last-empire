import { GameState } from "@/domain/game/game-state.schema";
import { GameStorageAdapter } from "@/infrastructure/storage/game-storage.adapter";

export class GamePersistenceService {
  private static storageAdapter = new GameStorageAdapter();

  public static async loadGameState(gameId: string): Promise<GameState | null> {
    return await this.storageAdapter.loadGameState(gameId);
  }

  public static async saveGameState(
    gameId: string,
    state: GameState,
  ): Promise<void> {
    await this.storageAdapter.saveGameState(gameId, state);
  }
}
