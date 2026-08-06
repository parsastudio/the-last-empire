import fs from "fs/promises";
import path from "path";
import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";
import { TerrainTextureGenerator } from "@/infrastructure/map-preprocessing/final/terrain-texture-generator";
import { FinalManifestBuilder } from "@/infrastructure/map-preprocessing/final/final-manifest-builder";
import { MapPathResolver } from "@/infrastructure/map-preprocessing/map-path-resolver";
import { BitPackedEnclaveClusterer } from "@/engine/combat/final/bit-packed-enclave-clusterer";
import { MAP_CONFIG } from "@/domain/map/map.config";

export class FinalMapPipeline {
  private manifestBuilder = new FinalManifestBuilder();
  private enclaveClusterer = new BitPackedEnclaveClusterer();

  public async buildFinalAssets(
    mapId = "map1",
    width = MAP_CONFIG.HIGH_RES_WIDTH,
    height = MAP_CONFIG.HIGH_RES_HEIGHT,
  ): Promise<{ success: boolean; byteLength: number }> {
    const finalDir = MapPathResolver.getMapFinalServerDir(mapId);
    await fs.mkdir(finalDir, { recursive: true });

    const partitionDir = MapPathResolver.getMapServerDir(mapId);
    const mask4KPath = path.join(partitionDir, "mask-4k.bin");

    const raw4K = await fs.readFile(mask4KPath);
    const maskBuffer = new Uint8Array(raw4K.buffer);

    const packedBuffer = new BitPackedBuffer(width, height);
    const activeCountryIds = new Set<number>();
    const pixelAreaMap = new Map<number, number>();

    const neighbors = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
    ];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const val = maskBuffer[idx] || 0;

        if (val >= MAP_CONFIG.MIN_NATION_ID && val < MAP_CONFIG.MAX_NATION_ID) {
          activeCountryIds.add(val);
          packedBuffer.setNationId(x, y, val);

          pixelAreaMap.set(val, (pixelAreaMap.get(val) || 0) + 1);

          let isFrontier = 0;
          for (let k = 0; k < 4; k++) {
            const nx = (x + neighbors[k]!.dx + width) % width;
            const ny = y + neighbors[k]!.dy;
            if (ny >= 0 && ny < height) {
              const nVal = maskBuffer[ny * width + nx] || 0;
              if (
                nVal >= MAP_CONFIG.MIN_NATION_ID &&
                nVal < MAP_CONFIG.MAX_NATION_ID &&
                nVal !== val
              ) {
                isFrontier = 1;
                break;
              }
            }
          }
          packedBuffer.setFrontier(x, y, isFrontier);

          let coastal = 0;
          for (let k = 0; k < 4; k++) {
            const nx = (x + neighbors[k]!.dx + width) % width;
            const ny = y + neighbors[k]!.dy;
            if (ny >= 0 && ny < height) {
              const nVal = maskBuffer[ny * width + nx] || 0;
              if (nVal === MAP_CONFIG.WATER_NATION_ID) {
                coastal = 1;
                break;
              } else if (nVal === MAP_CONFIG.CLOSED_SEA_NATION_ID) {
                coastal = 2;
                break;
              }
            }
          }
          packedBuffer.setCoastalAccess(x, y, coastal);
        }
      }
    }

    this.enclaveClusterer.clusterNationEnclaves(packedBuffer, width, height);

    const uint8ArrayData = packedBuffer.toUint8ArrayBuffer();
    await fs.writeFile(
      path.join(finalDir, "live-state.bin"),
      Buffer.from(uint8ArrayData.buffer),
    );

    const terrainPngBuffer = TerrainTextureGenerator.generateStaticTerrain(
      maskBuffer,
      width,
      height,
    );
    await fs.writeFile(
      path.join(finalDir, "base_map_terrain.png"),
      terrainPngBuffer,
    );

    await this.manifestBuilder.buildAndSave(
      mapId,
      activeCountryIds,
      pixelAreaMap,
      width,
      height,
    );

    return {
      success: true,
      byteLength: uint8ArrayData.byteLength,
    };
  }
}
