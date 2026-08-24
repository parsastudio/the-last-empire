import { GameState } from "@/domain/game/game-state.schema";
import { GameStorageAdapter } from "@/infrastructure/storage/game-storage.adapter";

export class GamePersistenceService {
  private static storageAdapter = new GameStorageAdapter();
  private static saveQueue: Promise<void> = Promise.resolve();

  private static scheduleTask(callback: () => Promise<void>): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const execute = () => {
        callback().then(resolve).catch(reject);
      };

      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        window.requestIdleCallback(() => execute(), { timeout: 1000 });
      } else {
        setTimeout(execute, 0);
      }
    });
  }

  public static async loadGameState(gameId: string): Promise<GameState | null> {
    await this.saveQueue;
    return await this.storageAdapter.loadGameState(gameId);
  }

  public static saveGameState(gameId: string, state: GameState): Promise<void> {
    this.saveQueue = this.saveQueue
      .catch(() => {})
      .then(() =>
        this.scheduleTask(() =>
          this.storageAdapter.saveGameState(gameId, state),
        ),
      );
    return this.saveQueue;
  }
}
