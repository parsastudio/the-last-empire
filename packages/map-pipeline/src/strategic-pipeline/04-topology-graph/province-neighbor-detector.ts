import { BitPackedBuffer, BitPackedCellUtility } from "@geopolitics/domain";
import { ProvinceClusterInfo } from "@/infrastructure/core/types/map-pipeline.types";

export class ProvinceNeighborDetector {
  private static readonly NEIGHBOR_OFFSETS = [
    { dx: 1, dy: 0 },
    { dx: -1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: 0, dy: -1 },
    { dx: 1, dy: 1 },
    { dx: -1, dy: 1 },
    { dx: 1, dy: -1 },
    { dx: -1, dy: -1 },
  ];

  public static detect(
    bitBuffer: BitPackedBuffer,
    width: number,
    height: number,
    provinceMap: Map<number, ProvinceClusterInfo>,
  ): void {
    const raw = bitBuffer.getRawBuffer();

    for (let y = 0; y < height; y++) {
      const rowOffset = y * width;
      for (let x = 0; x < width; x++) {
        const idx = rowOffset + x;
        const p1 = raw[idx]! & 0x0fff;

        if (p1 < BitPackedCellUtility.FIRST_PROVINCE_ID) continue;

        const info1 = provinceMap.get(p1);
        if (!info1) continue;

        for (let d = 0; d < this.NEIGHBOR_OFFSETS.length; d++) {
          const off = this.NEIGHBOR_OFFSETS[d]!;
          const nx = (x + off.dx + width) % width;
          const ny = y + off.dy;

          if (ny < 0 || ny >= height) continue;

          const nIdx = ny * width + nx;
          const pNeighbor = raw[nIdx]! & 0x0fff;

          if (pNeighbor === BitPackedCellUtility.WATER_OCEAN_ID) {
            info1.hasSeaAccess = true;
          } else if (
            pNeighbor >= BitPackedCellUtility.FIRST_PROVINCE_ID &&
            pNeighbor !== p1
          ) {
            info1.landNeighbors.add(pNeighbor);
            const info2 = provinceMap.get(pNeighbor);
            if (info2) {
              info2.landNeighbors.add(p1);
            }
          }
        }
      }
    }
  }
}
