import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";
import { FinalStateLoader } from "@/infrastructure/storage/final-state-loader";

export class GridLoaderService {
  private static isLoading = false;

  public static async ensureGridLoaded(): Promise<BitPackedGridState> {
    const gridState = BitPackedGridState.getInstance();
    if (this.isLoading) {
      return gridState;
    }

    this.isLoading = true;
    try {
      const bitBuffer = await FinalStateLoader.loadLiveStateBuffer("map1");
      if (bitBuffer) {
        gridState.getBuffer().getRawBuffer().set(bitBuffer.getRawBuffer());
      }
    } finally {
      this.isLoading = false;
    }

    return gridState;
  }
}
