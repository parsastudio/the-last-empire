export class DistanceTransformAlgorithms {
  public calculateL1(
    buffer: Uint8Array,
    width: number,
    height: number,
  ): Int32Array {
    const l1Dist = new Int32Array(width * height);
    l1Dist.fill(9999);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (buffer[idx]! >= 11 && buffer[idx]! < 250) {
          l1Dist[idx] = 0;
        } else {
          if (x > 0) l1Dist[idx] = Math.min(l1Dist[idx]!, l1Dist[idx - 1]! + 1);
          if (y > 0)
            l1Dist[idx] = Math.min(l1Dist[idx]!, l1Dist[idx - width]! + 1);
        }
      }
    }
    for (let y = height - 1; y >= 0; y--) {
      for (let x = width - 1; x >= 0; x--) {
        const idx = y * width + x;
        if (x < width - 1) {
          l1Dist[idx] = Math.min(l1Dist[idx]!, l1Dist[idx + 1]! + 1);
        }
        if (y < height - 1) {
          l1Dist[idx] = Math.min(l1Dist[idx]!, l1Dist[idx + width]! + 1);
        }
      }
    }
    return l1Dist;
  }

  public calculateChamfer(
    buffer: Uint8Array,
    width: number,
    height: number,
  ): Int32Array {
    const chamferDist = new Int32Array(width * height);
    chamferDist.fill(99999);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (buffer[idx]! >= 11 && buffer[idx]! < 250) {
          chamferDist[idx] = 0;
        } else {
          let m = chamferDist[idx]!;
          if (x > 0) m = Math.min(m, chamferDist[idx - 1]! + 3);
          if (y > 0) m = Math.min(m, chamferDist[idx - width]! + 3);
          if (x > 0 && y > 0)
            m = Math.min(m, chamferDist[idx - width - 1]! + 4);
          if (x < width - 1 && y > 0)
            m = Math.min(m, chamferDist[idx - width + 1]! + 4);
          chamferDist[idx] = m;
        }
      }
    }
    for (let y = height - 1; y >= 0; y--) {
      for (let x = width - 1; x >= 0; x--) {
        const idx = y * width + x;
        let m = chamferDist[idx]!;
        if (x < width - 1) m = Math.min(m, chamferDist[idx + 1]! + 3);
        if (y < height - 1) m = Math.min(m, chamferDist[idx + width]! + 3);
        if (x < width - 1 && y < height - 1)
          m = Math.min(m, chamferDist[idx + width + 1]! + 4);
        if (x > 0 && y < height - 1)
          m = Math.min(m, chamferDist[idx + width - 1]! + 4);
        chamferDist[idx] = m;
      }
    }
    return chamferDist;
  }
}
