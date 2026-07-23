import type { GameState } from "@/domain/game/game-state.schema";
import { StateSerializer } from "./state-serializer";

export class LocalStorageAdapter {
  private serializer = new StateSerializer();
  private keyPrefix = "geopolitics_game_";

  public saveState(gameId: string, state: GameState): void {
    if (typeof window === "undefined") {
      return;
    }
    const serialized = this.serializer.serialize(state);
    localStorage.setItem(`${this.keyPrefix}${gameId}`, serialized);
  }

  public loadState(gameId: string): GameState | null {
    if (typeof window === "undefined") {
      return null;
    }
    const stored = localStorage.getItem(`${this.keyPrefix}${gameId}`);
    if (!stored) {
      return null;
    }
    try {
      return this.serializer.deserialize(stored);
    } catch {
      return null;
    }
  }

  public removeState(gameId: string): void {
    if (typeof window === "undefined") {
      return;
    }
    localStorage.removeItem(`${this.keyPrefix}${gameId}`);
  }
}
