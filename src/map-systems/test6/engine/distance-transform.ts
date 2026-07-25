export class DistanceTransform {
  public calculate(
    buffer: Uint8Array,
    width: number,
    height: number,
  ): Int32Array {
    const dist = new Int32Array(width * height);
    dist.fill(9999);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (buffer[idx]! >= 11) {
          dist[idx] = 0;
        } else {
          if (x > 0) {
            dist[idx] = Math.min(dist[idx]!, dist[idx - 1]! + 1);
          }
          if (y > 0) {
            dist[idx] = Math.min(dist[idx]!, dist[idx - width]! + 1);
          }
        }
      }
    }

    for (let y = height - 1; y >= 0; y--) {
      for (let x = width - 1; x >= 0; x--) {
        const idx = y * width + x;
        if (x < width - 1) {
          dist[idx] = Math.min(dist[idx]!, dist[idx + 1]! + 1);
        }
        if (y < height - 1) {
          dist[idx] = Math.min(dist[idx]!, dist[idx + width]! + 1);
        }
      }
    }

    return dist;
  }

  public applySeaDepths(
    buffer: Uint8Array,
    dist: Int32Array,
    width: number,
    height: number,
  ): void {
    for (let i = 0; i < width * height; i++) {
      if (buffer[i]! < 11) {
        const d = dist[i]!;
        const depthIndex = Math.max(
          0,
          Math.min(10, 10 - Math.floor(Math.sqrt(d) * 0.8)),
        );
        buffer[i] = depthIndex;
      }
    }
  }
}
