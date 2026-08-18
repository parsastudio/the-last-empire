import {
  BitPackedBuffer,
  GameIdGenerator,
  FinalMapManifest,
} from "@geopolitics/domain";
import { BitPackedGridState } from "@geopolitics/game-engine";
import { ClientFinalStateLoader } from "@/infrastructure/storage/client-final-state-loader";

export type { FinalMapManifest };

export class BitPackedInitService {
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
    }

    return { gameId, buffer };
  }
}
