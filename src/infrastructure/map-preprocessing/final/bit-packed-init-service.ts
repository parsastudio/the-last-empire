import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";
import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";
import { ClientFinalStateLoader } from "@/infrastructure/storage/client-final-state-loader";
import { GameStorageAdapter } from "@/infrastructure/storage/game-storage.adapter";

export class BitPackedInitService {
  private static storageAdapter = new GameStorageAdapter();

  public static async initializeBitPackedSession(
    gameId: string,
  ): Promise<BitPackedBuffer> {
    const gridState = BitPackedGridState.getInstance();
    gridState.initializeSession(gameId);

    const buffer = gridState.getBuffer();
    const loadedBuffer =
      await ClientFinalStateLoader.loadLiveStateBuffer("map1");

    if (loadedBuffer) {
      gridState.getBuffer().getRawBuffer().set(loadedBuffer.getRawBuffer());
      gridState.markDirty();
      await this.storageAdapter.saveBitBuffer(gameId, gridState.getBuffer());
    } else {
      console.error(
        "❌ Failed to load live-state.bin during campaign initialization!",
      );
    }

    gridState.saveSnapshot(`${gameId}_initial`);
    return buffer;
  }
}
