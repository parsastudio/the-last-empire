import type { GameState } from "@/modules/game-engine/schemas/game-state.schema";

export interface StateStorageAdapter {
  saveState(gameId: string, state: GameState): Promise<void>;
  loadState(gameId: string): Promise<GameState | null>;
}

export class SyncEngine {
  private dbAdapter: StateStorageAdapter;
  private syncQueue: GameState[] = [];
  private isProcessing = false;

  constructor(dbAdapter: StateStorageAdapter) {
    this.dbAdapter = dbAdapter;
  }

  public queueStateSync(state: GameState): void {
    this.syncQueue.push(state);
    this.processSyncQueue();
  }

  private async processSyncQueue(): Promise<void> {
    if (this.isProcessing || this.syncQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const nextState = this.syncQueue.shift();

    if (nextState) {
      try {
        await this.dbAdapter.saveState(nextState.gameId, nextState);
      } catch {
        this.syncQueue.unshift(nextState);
      }
    }

    this.isProcessing = false;
    setTimeout(() => this.processSyncQueue(), 1000);
  }
}
