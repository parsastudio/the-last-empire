import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";

interface LandComponent {
  pixelIndices: number[];
  size: number;
}

export class BitPackedEnclaveClusterer {
  public clusterNationEnclaves(
    buffer: BitPackedBuffer,
    width = 4096,
    height = 2048,
  ): void {
    const totalPixels = width * height;
    const visited = new Uint8Array(totalPixels);

    const nationPixelsMap = new Map<number, number[]>();

    for (let i = 0; i < totalPixels; i++) {
      const nationId = buffer.getNationId(i % width, Math.floor(i / width));
      if (nationId >= 11 && nationId < 250) {
        let list = nationPixelsMap.get(nationId);
        if (!list) {
          list = [];
          nationPixelsMap.set(nationId, list);
        }
        list.push(i);
      }
    }

    const neighbors = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
      { dx: 1, dy: 1 },
      { dx: -1, dy: -1 },
      { dx: 1, dy: -1 },
      { dx: -1, dy: 1 },
    ];

    for (const [nationId, pixelIndices] of nationPixelsMap.entries()) {
      const nationPixelSet = new Set<number>(pixelIndices);
      const components: LandComponent[] = [];

      for (let k = 0; k < pixelIndices.length; k++) {
        const startIdx = pixelIndices[k]!;
        if (visited[startIdx] === 1) continue;

        const compIndices: number[] = [];
        const queue: number[] = [startIdx];
        visited[startIdx] = 1;

        let head = 0;
        while (head < queue.length) {
          const currIdx = queue[head++]!;
          compIndices.push(currIdx);

          const cx = currIdx % width;
          const cy = Math.floor(currIdx / width);

          for (let i = 0; i < 8; i++) {
            let nx = cx + neighbors[i]!.dx;
            if (nx < 0) nx = width - 1;
            else if (nx >= width) nx = 0;

            const ny = cy + neighbors[i]!.dy;
            if (ny >= 0 && ny < height) {
              const nIdx = ny * width + nx;
              if (visited[nIdx] === 0 && nationPixelSet.has(nIdx)) {
                visited[nIdx] = 1;
                queue.push(nIdx);
              }
            }
          }
        }

        components.push({
          pixelIndices: compIndices,
          size: compIndices.length,
        });
      }

      components.sort((a, b) => b.size - a.size);

      for (let cIdx = 0; cIdx < components.length; cIdx++) {
        const comp = components[cIdx]!;
        const enclaveId = Math.min(31, cIdx);

        for (let pIdx = 0; pIdx < comp.pixelIndices.length; pIdx++) {
          const idx = comp.pixelIndices[pIdx]!;
          const x = idx % width;
          const y = Math.floor(idx / width);
          buffer.setEnclaveId(x, y, enclaveId);
        }
      }
    }
  }
}
