import type { GameState } from "@/core/types";
import { IndexedDbAdapter } from "../storage/indexed-db-adapter";

export class SyncEngine {
  private dbAdapter = new IndexedDbAdapter();
  private syncQueue: GameState[] = [];
  private isProcessing = false;

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
