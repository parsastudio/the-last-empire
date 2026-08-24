import { GameState } from "@/domain/game/game-state.schema";
import { GameStorageAdapter } from "@/infrastructure/storage/game-storage.adapter";

export class GamePersistenceService {
  private static storageAdapter = new GameStorageAdapter();
  private static saveQueue: Promise<void> = Promise.resolve();

  public static async loadGameState(gameId: string): Promise<GameState | null> {
    await this.saveQueue;
    return await this.storageAdapter.loadGameState(gameId);
  }

  public static saveGameState(gameId: string, state: GameState): Promise<void> {
    this.saveQueue = this.saveQueue
      .catch(() => {})
      .then(() => this.storageAdapter.saveGameState(gameId, state));
    return this.saveQueue;
  }
}
