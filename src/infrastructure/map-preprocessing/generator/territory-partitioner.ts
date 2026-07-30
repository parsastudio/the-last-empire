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
      if (val !== 254 && partitionedIds.has(val)) {
        isPartitionedPixel[i] = 1;
      }
    }

    const ownerBuf = new Uint8Array(totalPixels);
    const landQueue = new Int32Array(totalPixels);
    let landHead = 0;
    let landTail = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const val = buffer[idx]!;
        if (val >= 11 && val < 250 && !partitionedIds.has(val)) {
          ownerBuf[idx] = val;
          landQueue[landTail++] = idx;
        }
      }
    }

    while (landHead < landTail) {
      const currIdx = landQueue[landHead++]!;
      const cx = currIdx % width;
      const cy = Math.floor(currIdx / width);
      const currOwner = ownerBuf[currIdx]!;

      const neighbors = [
        { nx: (cx + 1) % width, ny: cy },
        { nx: (cx - 1 + width) % width, ny: cy },
        { nx: cx, ny: Math.min(height - 1, cy + 1) },
        { nx: cx, ny: Math.max(0, cy - 1) },
      ];

      for (let i = 0; i < 4; i++) {
        const n = neighbors[i]!;
        const nIdx = n.ny * width + n.nx;
        const nVal = buffer[nIdx]!;

        if (nVal >= 11 && nVal !== 254 && ownerBuf[nIdx] === 0) {
          ownerBuf[nIdx] = currOwner;
          landQueue[landTail++] = nIdx;
        }
      }
    }

    const waterQueueX = new Int32Array(totalPixels);
    const waterQueueY = new Int32Array(totalPixels);
    const waterSeedX = new Int32Array(totalPixels);
    const waterSeedY = new Int32Array(totalPixels);
    const waterOwnerBuf = new Uint8Array(totalPixels);
    const waterVisited = new Uint8Array(totalPixels);

    let wHead = 0;
    let wTail = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const owner = ownerBuf[idx]!;
        if (owner > 0) {
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
            if (ownerBuf[nIdx] === 0) {
              isBorder = true;
              break;
            }
          }
          if (isBorder) {
            waterQueueX[wTail] = x;
            waterQueueY[wTail] = y;
            waterSeedX[wTail] = x;
            waterSeedY[wTail] = y;
            waterOwnerBuf[wTail] = owner;
            waterVisited[idx] = 1;
            wTail++;
          }
        }
      }
    }

    const kmPerPixelY = this.halfEarthMeridianKm / height;

    while (wHead < wTail) {
      const cx = waterQueueX[wHead]!;
      const cy = waterQueueY[wHead]!;
      const sx = waterSeedX[wHead]!;
      const sy = waterSeedY[wHead]!;
      const owner = waterOwnerBuf[wHead]!;
      wHead++;

      const neighbors = [
        { nx: (cx + 1) % width, ny: cy },
        { nx: (cx - 1 + width) % width, ny: cy },
        { nx: cx, ny: Math.min(height - 1, cy + 1) },
        { nx: cx, ny: Math.max(0, cy - 1) },
      ];

      for (let i = 0; i < 4; i++) {
        const n = neighbors[i]!;
        const nIdx = n.ny * width + n.nx;

        if (waterVisited[nIdx] === 0) {
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
            waterVisited[nIdx] = 1;

            if (isPartitionedPixel[nIdx] === 1 && ownerBuf[nIdx] === 0) {
              ownerBuf[nIdx] = owner;
            }

            waterQueueX[wTail] = n.nx;
            waterQueueY[wTail] = n.ny;
            waterSeedX[wTail] = sx;
            waterSeedY[wTail] = sy;
            waterOwnerBuf[wTail] = owner;
            wTail++;
          }
        }
      }
    }

    for (let i = 0; i < totalPixels; i++) {
      if (isPartitionedPixel[i] === 1) {
        if (ownerBuf[i]! > 0) {
          buffer[i] = ownerBuf[i]!;
        } else {
          buffer[i] = 250;
        }
      }
    }

    return buffer;
  }
}
