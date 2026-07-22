import type { GameState } from "@/core/types/game-state.types";
import { deepClone } from "@/core/utils/deep-clone";

export class StateHistory {
  private history: Map<number, GameState> = new Map();

  public saveSnapshot(state: GameState): void {
    this.history.set(state.currentTurn, deepClone(state));
  }

  public getTurnHistory(turnNumber: number): GameState | undefined {
    const found = this.history.get(turnNumber);
    return found ? deepClone(found) : undefined;
  }

  public clear(): void {
    this.history.clear();
  }

  public getSavedTurns(): number[] {
    return Array.from(this.history.keys()).sort((a, b) => a - b);
  }
}
