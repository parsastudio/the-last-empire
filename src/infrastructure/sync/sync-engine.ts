import type { GameState } from "@/domain/game/game-state.schema";
import { calculateStateHash } from "@/domain/shared/state-hash";
import { SyncDeltaPacker } from "@/infrastructure/sync/sync-delta-packer";

export interface StateStorageAdapter {
  saveState(gameId: string, state: GameState): Promise<void>;
  loadState(gameId: string): Promise<GameState | null>;
}

export class SyncEngine {
  private dbAdapter: StateStorageAdapter;
  private syncQueue: GameState[] = [];
  private isProcessing = false;
  private lastSavedState: GameState | null = null;
  private deltaPacker = new SyncDeltaPacker();

  constructor(dbAdapter: StateStorageAdapter) {
    this.dbAdapter = dbAdapter;
  }

  public queueStateSync(state: GameState): void {
    this.syncQueue.push(state);
    this.processSyncQueue();
  }

  public getDeltaPacket(currentState: GameState): unknown {
    const hash = calculateStateHash(currentState);
    return this.deltaPacker.createPack(currentState, this.lastSavedState, hash);
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
        this.lastSavedState = nextState;
      } catch {
        this.syncQueue.unshift(nextState);
      }
    }
    this.isProcessing = false;
    setTimeout(() => this.processSyncQueue(), 1000);
  }
}
