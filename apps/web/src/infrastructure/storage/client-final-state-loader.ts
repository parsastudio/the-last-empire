import {
  BitPackedBuffer,
  ClientMapPathResolver,
  CountryRegistry,
  MapTopologyRegistry,
  FinalMapManifest,
} from "@geopolitics/domain";
import { BitPackedGridState } from "@geopolitics/game-engine";

export class ClientFinalStateLoader {
  private static manifestPromise: Promise<FinalMapManifest | null> | null =
    null;

  public static async ensureManifestLoaded(
    mapId = "map1",
  ): Promise<FinalMapManifest | null> {
    if (MapTopologyRegistry.isReady()) {
      return null;
    }

    if (this.manifestPromise) {
      return this.manifestPromise;
    }

    this.manifestPromise = (async () => {
      try {
        const url = ClientMapPathResolver.getMapStrategicClientUrl(
          mapId,
          "manifest.json",
        );
        const res = await fetch(url);
        if (!res.ok) {
          return null;
        }

        const manifest: FinalMapManifest = await res.json();
        CountryRegistry.initializeFromManifest(manifest);
        MapTopologyRegistry.initializeFromManifest(manifest);
        return manifest;
      } catch {
        return null;
      } finally {
        this.manifestPromise = null;
      }
    })();

    return this.manifestPromise;
  }

  public static async loadLiveStateBuffer(
    mapId = "map1",
  ): Promise<BitPackedBuffer | null> {
    try {
      await this.ensureManifestLoaded(mapId);

      const url = ClientMapPathResolver.getMapStrategicClientUrl(
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
