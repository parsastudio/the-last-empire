import {
  BitPackedBuffer,
  ClientMapPathResolver,
  CountryRegistry,
  MapTopologyRegistry,
  FinalMapManifest,
} from "@geopolitics/domain";
import { BitPackedGridState } from "@geopolitics/game-engine";
import { BinaryAssetRepository } from "@/infrastructure/storage/repositories/binary-asset.repository";

export interface RawTerrainData {
  width: number;
  height: number;
  palette: Uint8Array;
  paletteCount: number;
  indexedGrid: Uint8Array;
}

export class ClientFinalStateLoader {
  private static manifestPromise: Promise<FinalMapManifest | null> | null =
    null;
  private static cachedTerrainData: RawTerrainData | null = null;
  private static cachedLiveStateRaw: Uint8Array | null = null;

  private static async decompressGzipBuffer(
    buffer: ArrayBuffer,
  ): Promise<ArrayBuffer | null> {
    if (typeof DecompressionStream === "undefined") {
      return null;
    }
    try {
      const blob = new Blob([buffer]);
      const stream = blob.stream().pipeThrough(new DecompressionStream("gzip"));
      return await new Response(stream).arrayBuffer();
    } catch {
      return null;
    }
  }

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
        const cacheKey = `${mapId}_manifest_json`;
        const cachedBuf = await BinaryAssetRepository.getAsset(cacheKey);

        if (cachedBuf) {
          const text = new TextDecoder().decode(cachedBuf);
          const manifest: FinalMapManifest = JSON.parse(text);
          CountryRegistry.initializeFromManifest(manifest);
          MapTopologyRegistry.initializeFromManifest(manifest);
          return manifest;
        }

        const url = ClientMapPathResolver.getMapStrategicClientUrl(
          mapId,
          "manifest.json",
        );
        const res = await fetch(url);
        if (!res.ok) {
          return null;
        }

        const text = await res.text();
        const manifest: FinalMapManifest = JSON.parse(text);
        CountryRegistry.initializeFromManifest(manifest);
        MapTopologyRegistry.initializeFromManifest(manifest);

        const encoded = new TextEncoder().encode(text);
        const copyBuf = encoded.buffer.slice(
          encoded.byteOffset,
          encoded.byteOffset + encoded.byteLength,
        ) as ArrayBuffer;
        void BinaryAssetRepository.saveAsset(cacheKey, copyBuf);

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

      if (this.cachedLiveStateRaw) {
        const copyBuffer = new ArrayBuffer(this.cachedLiveStateRaw.byteLength);
        new Uint8Array(copyBuffer).set(this.cachedLiveStateRaw);
        const bitBuffer = new BitPackedBuffer();
        bitBuffer.loadArrayBuffer(copyBuffer);
        BitPackedGridState.getInstance().markDirty();
        return bitBuffer;
      }

      const cacheKey = `${mapId}_live_state_gz`;
      const cachedGz = await BinaryAssetRepository.getAsset(cacheKey);

      let arrayBuf: ArrayBuffer | null = null;

      if (cachedGz) {
        arrayBuf = await this.decompressGzipBuffer(cachedGz);
      }

      if (!arrayBuf || arrayBuf.byteLength === 0) {
        const gzUrl = ClientMapPathResolver.getMapStrategicClientUrl(
          mapId,
          "live-state.bin.gz",
        );
        const rawUrl = ClientMapPathResolver.getMapStrategicClientUrl(
          mapId,
          "live-state.bin",
        );

        let fetchedGzBuf: ArrayBuffer | null = null;
        try {
          const gzRes = await fetch(gzUrl);
          if (gzRes.ok) {
            fetchedGzBuf = await gzRes.arrayBuffer();
          }
        } catch {}

        if (fetchedGzBuf && fetchedGzBuf.byteLength > 0) {
          void BinaryAssetRepository.saveAsset(cacheKey, fetchedGzBuf);
          arrayBuf = await this.decompressGzipBuffer(fetchedGzBuf);
        }

        if (!arrayBuf || arrayBuf.byteLength === 0) {
          try {
            const rawRes = await fetch(rawUrl);
            if (rawRes.ok) {
              arrayBuf = await rawRes.arrayBuffer();
            }
          } catch {}
        }
      }

      if (!arrayBuf || arrayBuf.byteLength === 0) {
        return null;
      }

      this.cachedLiveStateRaw = new Uint8Array(arrayBuf);

      const bitBuffer = new BitPackedBuffer();
      bitBuffer.loadArrayBuffer(arrayBuf);

      BitPackedGridState.getInstance().markDirty();
      return bitBuffer;
    } catch {
      return null;
    }
  }

  public static async loadTerrainRawData(
    mapId = "map1",
  ): Promise<RawTerrainData | null> {
    try {
      if (this.cachedTerrainData) {
        return this.cachedTerrainData;
      }

      const cacheKey = `${mapId}_terrain_raw_gz`;
      const cachedGz = await BinaryAssetRepository.getAsset(cacheKey);

      let arrayBuf: ArrayBuffer | null = null;

      if (cachedGz) {
        arrayBuf = await this.decompressGzipBuffer(cachedGz);
      }

      if (!arrayBuf || arrayBuf.byteLength < 32) {
        const gzUrl = ClientMapPathResolver.getMapVisualClientUrl(
          mapId,
          "terrain-raw.bin.gz",
        );
        const rawUrl = ClientMapPathResolver.getMapVisualClientUrl(
          mapId,
          "terrain-raw.bin",
        );

        let fetchedGzBuf: ArrayBuffer | null = null;
        try {
          const gzRes = await fetch(gzUrl);
          if (gzRes.ok) {
            fetchedGzBuf = await gzRes.arrayBuffer();
          }
        } catch {}

        if (fetchedGzBuf && fetchedGzBuf.byteLength > 0) {
          void BinaryAssetRepository.saveAsset(cacheKey, fetchedGzBuf);
          arrayBuf = await this.decompressGzipBuffer(fetchedGzBuf);
        }

        if (!arrayBuf || arrayBuf.byteLength < 32) {
          try {
            const rawRes = await fetch(rawUrl);
            if (rawRes.ok) {
              arrayBuf = await rawRes.arrayBuffer();
            }
          } catch {}
        }
      }

      if (!arrayBuf || arrayBuf.byteLength < 32) {
        return null;
      }

      const dataView = new DataView(arrayBuf);
      const magic = dataView.getUint32(0, true);
      if (magic !== 0x54524157) {
        return null;
      }

      const width = dataView.getUint16(6, true);
      const height = dataView.getUint16(8, true);
      const paletteCount = dataView.getUint16(10, true);
      const paletteOffset = dataView.getUint32(12, true);
      const gridOffset = dataView.getUint32(16, true);
      const gridBytes = dataView.getUint32(20, true);

      const fullBuffer = new Uint8Array(arrayBuf);
      const palette = new Uint8Array(256 * 4);
      palette.set(
        fullBuffer.subarray(paletteOffset, paletteOffset + paletteCount * 4),
      );

      const indexedGrid = fullBuffer.subarray(
        gridOffset,
        gridOffset + gridBytes,
      );

      this.cachedTerrainData = {
        width,
        height,
        palette,
        paletteCount,
        indexedGrid,
      };

      return this.cachedTerrainData;
    } catch {
      return null;
    }
  }
}
