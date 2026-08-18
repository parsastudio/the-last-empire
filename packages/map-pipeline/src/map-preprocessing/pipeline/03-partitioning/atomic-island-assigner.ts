import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/core/bit-packed-buffer";
import {
  LandComponent,
  ProvinceClusterInfo,
} from "@/infrastructure/map-preprocessing/core/map-preprocessing.types";

export class AtomicIslandAssigner {
  public static assignMinorComponentsAtomically(
    minorComponents: LandComponent[],
    assignedProvinceIds: number[],
    width: number,
    bitBuffer: BitPackedBuffer,
    provinceMap: Map<number, ProvinceClusterInfo>,
  ): void {
    if (assignedProvinceIds.length === 0 || minorComponents.length === 0) {
      return;
    }

    const assignedSet = new Set<number>(assignedProvinceIds);
    const height = bitBuffer.getHeight();
    const raw = bitBuffer.getRawBuffer();
    const totalPixels = width * height;

    const dirs = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
    ];

    for (let c = 0; c < minorComponents.length; c++) {
      const island = minorComponents[c]!;
      let bestProvinceId = assignedProvinceIds[0]!;

      const queue: number[] = [];
      const visited = new Uint8Array(totalPixels);

      for (let i = 0; i < island.pixelIndices.length; i++) {
        const pIdx = island.pixelIndices[i]!;
        queue.push(pIdx);
        visited[pIdx] = 1;
      }

      let head = 0;
      let found = false;

      while (head < queue.length && !found) {
        const curr = queue[head++]!;
        const cx = curr % width;
        const cy = Math.floor(curr / width);

        for (let d = 0; d < 4; d++) {
          const dir = dirs[d]!;
          const nx = (cx + dir.dx + width) % width;
          const ny = cy + dir.dy;

          if (ny >= 0 && ny < height) {
            const nIdx = ny * width + nx;
            if (visited[nIdx] === 0) {
              visited[nIdx] = 1;
              const nPid = raw[nIdx]! & 0x0fff;

              if (assignedSet.has(nPid)) {
                bestProvinceId = nPid;
                found = true;
                break;
              }

              queue.push(nIdx);
            }
          }
        }
      }

      for (let i = 0; i < island.pixelIndices.length; i++) {
        const idx = island.pixelIndices[i]!;
        const x = idx % width;
        const y = Math.floor(idx / width);
        bitBuffer.setPixel(x, y, bestProvinceId);
      }

      const targetInfo = provinceMap.get(bestProvinceId);
      if (targetInfo) {
        targetInfo.pixelCount += island.size;
      }
    }
  }
}
