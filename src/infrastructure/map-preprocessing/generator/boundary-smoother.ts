export class BoundarySmoother {
  private readonly radius = 6;

  public smoothBoundaries(
    buffer: Uint8Array,
    width: number,
    height: number,
  ): Uint8Array {
    const totalPixels = width * height;
    const isBorderZone = new Uint8Array(totalPixels);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const currentVal = buffer[idx]!;

        if (currentVal < 11 || currentVal >= 250) {
          continue;
        }

        const neighbors = [
          buffer[y * width + ((x + 1) % width)]!,
          buffer[y * width + ((x - 1 + width) % width)]!,
          buffer[Math.min(height - 1, y + 1) * width + x]!,
          buffer[Math.max(0, y - 1) * width + x]!,
        ];

        for (let i = 0; i < 4; i++) {
          const nVal = neighbors[i]!;
          if (nVal !== currentVal) {
            for (let dy = -this.radius; dy <= this.radius; dy++) {
              const ny = Math.min(height - 1, Math.max(0, y + dy));
              for (let dx = -this.radius; dx <= this.radius; dx++) {
                const nx = (x + dx + width) % width;
                const distSq = dx * dx + dy * dy;
                if (distSq <= this.radius * this.radius) {
                  isBorderZone[ny * width + nx] = 1;
                }
              }
            }
            break;
          }
        }
      }
    }

    const queueX = new Int32Array(totalPixels);
    const queueY = new Int32Array(totalPixels);
    const seedX = new Int32Array(totalPixels);
    const seedY = new Int32Array(totalPixels);
    const ownerBuf = new Uint8Array(totalPixels);
    const visited = new Uint8Array(totalPixels);

    let head = 0;
    let tail = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (isBorderZone[idx] === 0) {
          const val = buffer[idx]!;
          if (val >= 11 && val < 250) {
            queueX[tail] = x;
            queueY[tail] = y;
            seedX[tail] = x;
            seedY[tail] = y;
            ownerBuf[tail] = val;
            visited[idx] = 1;
            tail++;
          }
        }
      }
    }

    while (head < tail) {
      const cx = queueX[head]!;
      const cy = queueY[head]!;
      const sx = seedX[head]!;
      const sy = seedY[head]!;
      const owner = ownerBuf[head]!;
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

        if (isBorderZone[nIdx] === 1 && visited[nIdx] === 0) {
          const origVal = buffer[nIdx]!;
          if (origVal >= 11 && origVal < 250) {
            visited[nIdx] = 1;
            buffer[nIdx] = owner;

            queueX[tail] = n.nx;
            queueY[tail] = n.ny;
            seedX[tail] = sx;
            seedY[tail] = sy;
            ownerBuf[tail] = owner;
            tail++;
          }
        }
      }
    }

    return buffer;
  }
}
