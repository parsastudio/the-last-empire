import { GridState } from "@/engine/combat/state/grid-state";

export class GridStateProvider {
  private static instance: GridState | null = null;

  public static getInstance(): GridState {
    if (!GridStateProvider.instance) {
      GridStateProvider.instance = new GridState();
    }
    return GridStateProvider.instance;
  }

  public static clearInstance(): void {
    GridStateProvider.instance = null;
  }
}
