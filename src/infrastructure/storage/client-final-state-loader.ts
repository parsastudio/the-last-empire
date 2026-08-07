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
      console.group("🌐 [RUNTIME TEST 1] ClientFinalStateLoader");
      console.info("Fetching static map binary from:", url);

      const res = await fetch(url, { cache: "no-cache" });
      console.info("Fetch HTTP Status:", res.status, res.statusText);

      if (!res.ok) {
        console.error(
          "❌ Failed to fetch live-state.bin. HTTP status:",
          res.status,
        );
        console.groupEnd();
        return null;
      }

      const arrayBuf = await res.arrayBuffer();
      console.info("Received ArrayBuffer byteLength:", arrayBuf.byteLength);

      if (arrayBuf.byteLength === 0) {
        console.error("❌ live-state.bin is 0 bytes!");
        console.groupEnd();
        return null;
      }

      const bitBuffer = new BitPackedBuffer();
      bitBuffer.loadArrayBuffer(arrayBuf);

      const raw = bitBuffer.getRawBuffer();
      let nonZeroCount = 0;
      const uniqueNations = new Set<number>();

      for (let i = 0; i < raw.length; i += 16) {
        const nationId = raw[i]! & 0x00ff;
        if (nationId > 0) {
          nonZeroCount++;
          uniqueNations.add(nationId);
        }
      }

      console.info("Parsed non-zero pixel count:", nonZeroCount);
      console.info(
        "Unique Nation IDs found in live-state.bin:",
        Array.from(uniqueNations),
      );

      if (nonZeroCount === 0) {
        console.error(
          "❌ live-state.bin was fetched but contains 0 nation pixels!",
        );
        console.groupEnd();
        return null;
      }

      console.info(
        "✅ live-state.bin successfully verified with valid nation pixels!",
      );
      console.groupEnd();

      this.cachedBuffer = bitBuffer;
      BitPackedGridState.getInstance().markDirty();
      return this.cachedBuffer;
    } catch (err) {
      console.error(
        "❌ Network or Parsing Error in ClientFinalStateLoader:",
        err,
      );
      console.groupEnd();
      return null;
    }
  }

  public static clearCache(): void {
    this.cachedBuffer = null;
  }
}
