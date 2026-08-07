import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";
import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";
import { ClientFinalStateLoader } from "@/infrastructure/storage/client-final-state-loader";
import { GameStorageAdapter } from "@/infrastructure/storage/game-storage.adapter";
import { GameIdGenerator } from "@/domain/shared/domain-utilities";

export class BitPackedInitService {
  private static storageAdapter = new GameStorageAdapter();

  public static async initializeBitPackedSession(
    nationId: string,
  ): Promise<{ gameId: string; buffer: BitPackedBuffer }> {
    const gameId = GameIdGenerator.generateCampaignId(nationId);
    const gridState = BitPackedGridState.getInstance();
    gridState.initializeSession(gameId);

    const buffer = gridState.getBuffer();
    const loadedBuffer =
      await ClientFinalStateLoader.loadLiveStateBuffer("map1");

    if (loadedBuffer) {
      gridState.getBuffer().getRawBuffer().set(loadedBuffer.getRawBuffer());
      gridState.markDirty();
      await this.storageAdapter.saveBitBuffer(gameId, gridState.getBuffer());
    }

    gridState.saveSnapshot(`${gameId}_initial`);
    return { gameId, buffer };
  }
}
