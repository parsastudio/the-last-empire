import { BitPackedBuffer, ClientMapPathResolver } from "@geopolitics/domain";
import { BitPackedGridState } from "@geopolitics/game-engine";

export class ClientFinalStateLoader {
  public static async loadLiveStateBuffer(
    mapId = "map1",
  ): Promise<BitPackedBuffer | null> {
    try {
      const url = ClientMapPathResolver.getMapFinalClientUrl(
        mapId,
        "live-state.bin",
      );
      const res = await fetch(url, { cache: "no-store" });

      if (!res.ok) {
        return null;
      }

      const arrayBuf = await res.arrayBuffer();
      if (arrayBuf.byteLength === 0) {
        return null;
      }

      const bitBuffer = new BitPackedBuffer();
      bitBuffer.loadArrayBuffer(arrayBuf);

      BitPackedGridState.getInstance().markDirty();
      return bitBuffer;
    } catch {
      return null;
    }
  }
}
