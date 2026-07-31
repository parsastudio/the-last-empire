import type { GameState } from "@/domain/game/game-state.schema";
import { deepClone } from "@/domain/shared/deep-clone";

export class StateHistory {
  private history: Map<number, GameState> = new Map();

  public saveSnapshot(state: GameState): void {
    this.history.set(state.currentTurn, deepClone(state));
  }

  public getTurnHistory(turnNumber: number): GameState | undefined {
    const found = this.history.get(turnNumber);
    return found ? deepClone(found) : undefined;
  }
}
