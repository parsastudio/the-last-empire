import { PARTITION_COUNTRIES_LIST } from "../config/partition-countries.config";

export class TerritoryPartitioner {
  private readonly maxDistanceKm = 30.0;
  private readonly earthCircumferenceKm = 40075.0;
  private readonly halfEarthMeridianKm = 20015.0;

  public partitionBuffer(
    buffer: Uint8Array,
    width: number,
    height: number,
    idToCodeMap: Map<number, string>,
  ): Uint8Array {
    const partitionCodes = new Set(
      PARTITION_COUNTRIES_LIST.map((c) => c.toUpperCase()),
    );

    const partitionedIds = new Set<number>();
    for (const [id, code] of idToCodeMap.entries()) {
      if (partitionCodes.has(code.toUpperCase())) {
        partitionedIds.add(id);
      }
    }

    if (partitionedIds.size === 0) {
      return buffer;
    }

    const totalPixels = width * height;
    const isPartitionedPixel = new Uint8Array(totalPixels);
    for (let i = 0; i < totalPixels; i++) {
      const val = buffer[i]!;
      if (val === 254) {
        continue;
      }
      if (partitionedIds.has(val)) {
        isPartitionedPixel[i] = 1;
      }
    }

    const queueX = new Int32Array(totalPixels);
    const queueY = new Int32Array(totalPixels);
    const seedX = new Int32Array(totalPixels);
    const seedY = new Int32Array(totalPixels);
    const ownerIdBuf = new Uint8Array(totalPixels);
    const visited = new Uint8Array(totalPixels);

    let head = 0;
    let tail = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (isPartitionedPixel[idx] === 1) {
          continue;
        }

        const currentVal = buffer[idx]!;
        if (currentVal < 11 || currentVal >= 250) {
          continue;
        }

        let isBorder = false;
        const neighbors = [
          { nx: (x + 1) % width, ny: y },
          { nx: (x - 1 + width) % width, ny: y },
          { nx: x, ny: Math.min(height - 1, y + 1) },
          { nx: x, ny: Math.max(0, y - 1) },
        ];

        for (let i = 0; i < 4; i++) {
          const n = neighbors[i]!;
          const nIdx = n.ny * width + n.nx;
          if (isPartitionedPixel[nIdx] === 1) {
            isBorder = true;
            break;
          }
        }

        if (isBorder) {
          queueX[tail] = x;
          queueY[tail] = y;
          seedX[tail] = x;
          seedY[tail] = y;
          ownerIdBuf[tail] = currentVal;
          visited[idx] = 1;
          tail++;
        }
      }
    }

    const kmPerPixelY = this.halfEarthMeridianKm / height;

    while (head < tail) {
      const cx = queueX[head]!;
      const cy = queueY[head]!;
      const sx = seedX[head]!;
      const sy = seedY[head]!;
      const owner = ownerIdBuf[head]!;
      head++;

      const neighbors = [
        { nx: (cx + 1) % width, ny: cy },
        { nx: (cx - 1 + width) % width, ny: cy },
        { nx: cx, ny: Math.min(height - 1, cy + 1) },
        { nx: cx, ny: Math.max(0, cy - 1) },
      ];

      for (let i = 0; i < 4; i++) {
        const n = neighbors[i]!;
        const nIdx = n.ny * width + n.nx;

        if (isPartitionedPixel[nIdx] === 1 && visited[nIdx] === 0) {
          const dyKm = (n.ny - sy) * kmPerPixelY;
          const latRad = (0.5 - (n.ny + 0.5) / height) * Math.PI;
          const kmPerPixelX =
            (this.earthCircumferenceKm / width) * Math.cos(latRad);

          let dxPixels = Math.abs(n.nx - sx);
          if (dxPixels > width / 2) {
            dxPixels = width - dxPixels;
          }
          const dxKm = dxPixels * kmPerPixelX;

          const distKm = Math.sqrt(dxKm * dxKm + dyKm * dyKm);

          if (distKm <= this.maxDistanceKm) {
            visited[nIdx] = 1;
            buffer[nIdx] = owner;

            queueX[tail] = n.nx;
            queueY[tail] = n.ny;
            seedX[tail] = sx;
            seedY[tail] = sy;
            ownerIdBuf[tail] = owner;
            tail++;
          }
        }
      }
    }

    for (let i = 0; i < totalPixels; i++) {
      if (isPartitionedPixel[i] === 1 && visited[i] === 0) {
        buffer[i] = 250;
      }
    }

    return buffer;
  }
}
