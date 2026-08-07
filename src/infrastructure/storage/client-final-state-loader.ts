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
      console.group("🔍 [DIAGNOSTIC] ClientFinalStateLoader");
      console.info("Fetching binary map file from:", url);

      const res = await fetch(url, { cache: "force-cache" });
      console.info("Fetch HTTP Status:", res.status, res.statusText);

      if (!res.ok) {
        console.error(
          "❌ FAILED TO FETCH live-state.bin. HTTP status:",
          res.status,
        );
        console.groupEnd();
        return null;
      }

      const arrayBuf = await res.arrayBuffer();
      console.info("Received binary byteLength:", arrayBuf.byteLength);

      if (arrayBuf.byteLength === 0) {
        console.error("❌ live-state.bin file exists but is 0 bytes!");
        console.groupEnd();
        return null;
      }

      const bitBuffer = new BitPackedBuffer();
      bitBuffer.loadArrayBuffer(arrayBuf);

      const raw = bitBuffer.getRawBuffer();
      let nonZeroCount = 0;
      const nationsFound = new Set<number>();

      for (let i = 0; i < raw.length; i += 16) {
        const nationId = raw[i]! & 0x00ff;
        if (nationId > 0) {
          nonZeroCount++;
          nationsFound.add(nationId);
        }
      }

      console.info("Sampled non-zero pixels count:", nonZeroCount);
      console.info(
        "Unique Nations detected in binary:",
        Array.from(nationsFound),
      );

      if (nonZeroCount === 0) {
        console.warn(
          "⚠️ WARNING: live-state.bin was loaded but contains ALL ZEROS!",
        );
      } else {
        console.info(
          "✅ live-state.bin successfully loaded and contains valid nation data!",
        );
      }
      console.groupEnd();

      this.cachedBuffer = bitBuffer;
      BitPackedGridState.getInstance().markDirty();
      return this.cachedBuffer;
    } catch (err) {
      console.error("❌ CRITICAL ERROR in loadLiveStateBuffer:", err);
      console.groupEnd();
      return null;
    }
  }

  public static clearCache(): void {
    this.cachedBuffer = null;
  }
}
