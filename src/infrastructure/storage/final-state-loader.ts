import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";
import { ClientFinalStateLoader } from "@/infrastructure/storage/client-final-state-loader";

export class FinalStateLoader {
  public static async loadLiveStateBuffer(
    mapId = "map1",
  ): Promise<BitPackedBuffer | null> {
    return ClientFinalStateLoader.loadLiveStateBuffer(mapId);
  }

  public static clearCache(): void {
    ClientFinalStateLoader.clearCache();
  }
}
