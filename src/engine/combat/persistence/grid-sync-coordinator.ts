import { GridState } from "@/engine/combat/state/grid-state";
import { IndexedDbGridAdapter } from "@/engine/combat/persistence/indexed-db-grid-adapter";

export class GridSyncCoordinator {
  private adapter = new IndexedDbGridAdapter();
  private syncQueue: { gameId: string; state: GridState }[] = [];
  private isProcessing = false;

  public queueGridSync(gameId: string, gridState: GridState): void {
    this.syncQueue.push({ gameId, state: gridState });
    this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.syncQueue.length === 0) {
      return;
    }
    this.isProcessing = true;
    const next = this.syncQueue.shift();
    if (next) {
      try {
        await this.adapter.saveGridState(next.gameId, next.state);
      } catch {
        this.syncQueue.unshift(next);
      }
    }
    this.isProcessing = false;
    setTimeout(() => this.processQueue(), 1000);
  }
}
