import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";

export class GridStateProvider {
  public static getInstance(): BitPackedGridState {
    return BitPackedGridState.getInstance();
  }

  public static clearInstance(): void {
    const instance = BitPackedGridState.getInstance();
    instance.clearModifiedIndices();
  }
}
