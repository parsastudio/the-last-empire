import { GridHistoryState } from "@/engine/combat/history/grid-history-state.schema";

export class GridHistoryStateRegistry {
  private registry = new Map<number, GridHistoryState>();

  public registerHistoryState(turn: number, state: GridHistoryState): void {
    this.registry.set(turn, state);
  }

  public getHistoryState(turn: number): GridHistoryState | undefined {
    return this.registry.get(turn);
  }

  public clear(): void {
    this.registry.clear();
  }
}
