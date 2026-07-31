export class DistanceTransform {
  public calculate(
    buffer: Uint8Array,
    width: number,
    height: number,
  ): Int32Array {
    const dist = new Int32Array(width * height);
    dist.fill(99999);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (buffer[idx]! >= 11 && buffer[idx]! < 250) {
          dist[idx] = 0;
        } else {
          let m = dist[idx]!;
          if (x > 0) m = Math.min(m, dist[idx - 1]! + 3);
          if (y > 0) m = Math.min(m, dist[idx - width]! + 3);
          if (x > 0 && y > 0) m = Math.min(m, dist[idx - width - 1]! + 4);
          if (x < width - 1 && y > 0)
            m = Math.min(m, dist[idx - width + 1]! + 4);
          dist[idx] = m;
        }
      }
    }
    for (let y = height - 1; y >= 0; y--) {
      for (let x = width - 1; x >= 0; x--) {
        const idx = y * width + x;
        let m = dist[idx]!;
        if (x < width - 1) m = Math.min(m, dist[idx + 1]! + 3);
        if (y < height - 1) m = Math.min(m, dist[idx + width]! + 3);
        if (x < width - 1 && y < height - 1)
          m = Math.min(m, dist[idx + width + 1]! + 4);
        if (x > 0 && y < height - 1)
          m = Math.min(m, dist[idx + width - 1]! + 4);
        dist[idx] = m;
      }
    }
    return dist;
  }
}
