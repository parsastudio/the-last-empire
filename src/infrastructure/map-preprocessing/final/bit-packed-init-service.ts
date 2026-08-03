import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";
import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";
import { FinalStateLoader } from "@/infrastructure/storage/final-state-loader";

export class BitPackedInitService {
  public static async initializeBitPackedSession(
    gameId: string,
  ): Promise<BitPackedBuffer> {
    const gridState = BitPackedGridState.getInstance();
    const buffer = gridState.getBuffer();

    const loadedBuffer = await FinalStateLoader.loadLiveStateBuffer("map1");
    if (loadedBuffer) {
      gridState.getBuffer().getRawBuffer().set(loadedBuffer.getRawBuffer());
    }

    gridState.saveSnapshot(`${gameId}_initial`);
    return buffer;
  }
}
