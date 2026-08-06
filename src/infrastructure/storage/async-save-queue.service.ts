import { GameState } from "@/domain/game/game-state.schema";
import { GameStorageAdapter } from "@/infrastructure/storage/game-storage.adapter";
import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";

export class AsyncSaveQueueService {
  private static instance: AsyncSaveQueueService | null = null;
  private gameStorageAdapter = new GameStorageAdapter();

  private pendingStateMap = new Map<string, GameState>();
  private saveTimers = new Map<string, NodeJS.Timeout>();
  private isProcessingMap = new Map<string, boolean>();

  public static getInstance(): AsyncSaveQueueService {
    if (!AsyncSaveQueueService.instance) {
      AsyncSaveQueueService.instance = new AsyncSaveQueueService();
    }
    return AsyncSaveQueueService.instance;
  }

  public enqueueSave(
    gameId: string,
    state: GameState,
    immediate = false,
  ): void {
    this.pendingStateMap.set(gameId, state);

    const existingTimer = this.saveTimers.get(gameId);
    if (existingTimer) {
      clearTimeout(existingTimer);
      this.saveTimers.delete(gameId);
    }

    if (immediate) {
      void this.flush(gameId);
      return;
    }

    const timer = setTimeout(() => {
      void this.flush(gameId);
    }, 1200);

    this.saveTimers.set(gameId, timer);
  }

  public async flush(gameId: string): Promise<void> {
    const pendingState = this.pendingStateMap.get(gameId);
    if (!pendingState || this.isProcessingMap.get(gameId)) {
      return;
    }

    this.isProcessingMap.set(gameId, true);
    this.pendingStateMap.delete(gameId);

    const timer = this.saveTimers.get(gameId);
    if (timer) {
      clearTimeout(timer);
      this.saveTimers.delete(gameId);
    }

    try {
      await this.gameStorageAdapter.saveGameState(gameId, pendingState);
      const gridState = BitPackedGridState.getInstance();
      await this.gameStorageAdapter.saveBitBuffer(
        gameId,
        gridState.getBuffer(),
      );
    } catch {
    } finally {
      this.isProcessingMap.set(gameId, false);

      if (this.pendingStateMap.has(gameId)) {
        void this.flush(gameId);
      }
    }
  }
}
