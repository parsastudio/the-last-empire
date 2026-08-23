import fs from "fs/promises";
import path from "path";
import {
  FinalMapManifest,
  FinalManifestProvince,
  BitPackedCellUtility,
} from "@geopolitics/domain";
import { ServerMapPathResolver } from "@/infrastructure/core/io/server-map-path-resolver";
import {
  CoastalShorelinePixel,
  MaritimeDistancePair,
  MaritimeEnrichmentStats,
  ProvinceMaritimeResolution,
} from "@/infrastructure/strategic-pipeline/05-maritime-network/core/maritime-topology.types";
import { MaritimeWaterGridBuilder } from "@/infrastructure/strategic-pipeline/05-maritime-network/algorithms/maritime-water-grid-builder";
import { BoundedWaterBfs } from "@/infrastructure/strategic-pipeline/05-maritime-network/algorithms/bounded-water-bfs";

export class MaritimeEnricherEngine {
  public static async enrichManifestMaritimeTopology(
    mapId = "map1",
  ): Promise<MaritimeEnrichmentStats> {
    const startTime = Date.now();
    const strategicDir = ServerMapPathResolver.getMapStrategicServerDir(mapId);
    const liveStatePath = path.join(strategicDir, "live-state.bin");
    const manifestPath = path.join(strategicDir, "manifest.json");

    const rawBuffer = await fs.readFile(liveStatePath);
    const highResGrid = new Uint16Array(
      rawBuffer.buffer,
      rawBuffer.byteOffset,
      rawBuffer.byteLength / 2,
    );

    const manifestContent = await fs.readFile(manifestPath, "utf-8");
    const manifest: FinalMapManifest = JSON.parse(manifestContent);

    const topologyGrid =
      MaritimeWaterGridBuilder.buildTopologyGrid(highResGrid);

    const topWidth = MaritimeWaterGridBuilder.TOPOLOGY_WIDTH;
    const topHeight = MaritimeWaterGridBuilder.TOPOLOGY_HEIGHT;

    const shorelineMap = new Map<number, CoastalShorelinePixel[]>();

    const dirs4 = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
    ];

    for (let y = 0; y < topHeight; y++) {
      const rowOffset = y * topWidth;
      for (let x = 0; x < topWidth; x++) {
        const idx = rowOffset + x;
        const pid = topologyGrid[idx]! & 0x0fff;

        if (pid < BitPackedCellUtility.FIRST_PROVINCE_ID) continue;

        for (let d = 0; d < 4; d++) {
          const nx = (x + dirs4[d]!.dx + topWidth) % topWidth;
          const ny = y + dirs4[d]!.dy;

          if (ny >= 0 && ny < topHeight) {
            const nCell = topologyGrid[ny * topWidth + nx]! & 0x0fff;
            if (nCell === BitPackedCellUtility.WATER_OCEAN_ID) {
              let list = shorelineMap.get(pid);
              if (!list) {
                list = [];
                shorelineMap.set(pid, list);
              }
              list.push({ x: nx, y: ny, provinceId: pid });
            }
          }
        }
      }
    }

    const bfs = new BoundedWaterBfs();
    const provinceMapById = new Map<number, FinalManifestProvince>();
    for (const p of manifest.provinces) {
      provinceMapById.set(p.provinceId, p);
    }

    const resolutions: ProvinceMaritimeResolution[] = [];
    let totalTier1 = 0;
    let totalTier2 = 0;

    for (const province of manifest.provinces) {
      const shorePixels = shorelineMap.get(province.provinceId) || [];

      if (shorePixels.length === 0 || !province.hasSeaAccess) {
        province.maritimeNeighborsTier1 = [];
        province.maritimeNeighborsTier2 = [];
        continue;
      }

      const { tier1Neighbors, tier2Neighbors } =
        bfs.findMaritimeNeighborsForProvince(
          province.provinceId,
          shorePixels,
          topologyGrid,
        );

      province.maritimeNeighborsTier1 = tier1Neighbors.map(
        (n: MaritimeDistancePair) => n.targetProvinceId,
      );
      province.maritimeNeighborsTier2 = tier2Neighbors.map(
        (n: MaritimeDistancePair) => n.targetProvinceId,
      );

      totalTier1 += tier1Neighbors.length;
      totalTier2 += tier2Neighbors.length;

      resolutions.push({
        provinceId: province.provinceId,
        nameFa: province.nameFa,
        countryId: province.countryId,
        tier1Neighbors,
        tier2Neighbors,
      });
    }

    await fs.writeFile(
      manifestPath,
      JSON.stringify(manifest, null, 2),
      "utf-8",
    );

    const coastalCount = resolutions.length;
    const executionTimeMs = Date.now() - startTime;

    return {
      totalCoastalProvinces: coastalCount,
      totalTier1Connections: totalTier1,
      totalTier2Connections: totalTier2,
      avgTier1PerProvince: Number(
        (totalTier1 / (coastalCount || 1)).toFixed(1),
      ),
      avgTier2PerProvince: Number(
        (totalTier2 / (coastalCount || 1)).toFixed(1),
      ),
      executionTimeMs,
      resolutions,
    };
  }
}
