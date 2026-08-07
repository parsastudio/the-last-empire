import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";
import { MapPathResolver } from "@/infrastructure/map-preprocessing/map-path-resolver";
import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";

export class ClientFinalStateLoader {
  private static cachedBuffer: BitPackedBuffer | null = null;

  public static async loadLiveStateBuffer(
    mapId = "map1",
  ): Promise<BitPackedBuffer | null> {
    if (this.cachedBuffer) {
      BitPackedGridState.getInstance().markDirty();
      return this.cachedBuffer;
    }

    try {
      const url = MapPathResolver.getMapFinalClientUrl(mapId, "live-state.bin");
      const res = await fetch(url, { cache: "no-cache" });

      if (!res.ok) {
        return null;
      }

      const arrayBuf = await res.arrayBuffer();
      if (arrayBuf.byteLength === 0) {
        return null;
      }

      const bitBuffer = new BitPackedBuffer();
      bitBuffer.loadArrayBuffer(arrayBuf);

      this.cachedBuffer = bitBuffer;
      BitPackedGridState.getInstance().markDirty();
      return this.cachedBuffer;
    } catch {
      return null;
    }
  }

  public static clearCache(): void {
    this.cachedBuffer = null;
  }
}
