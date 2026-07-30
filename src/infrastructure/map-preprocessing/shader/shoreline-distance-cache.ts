export class ShorelineDistanceCache {
  private static cachedMaskRef: Uint8Array | null = null;
  private static cachedDist: Int32Array | null = null;

  public static getOrCreateDistanceTransform(
    maskData: Uint8Array,
    width: number,
    height: number,
  ): Int32Array {
    if (
      this.cachedMaskRef === maskData &&
      this.cachedDist &&
      this.cachedDist.length === width * height
    ) {
      return this.cachedDist;
    }

    const dist = new Int32Array(width * height);
    dist.fill(9999);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const val = maskData[idx];
        if (val && val >= 11 && val < 250) {
          dist[idx] = 0;
        } else {
          if (x > 0) dist[idx] = Math.min(dist[idx]!, dist[idx - 1]! + 1);
          if (y > 0) dist[idx] = Math.min(dist[idx]!, dist[idx - width]! + 1);
        }
      }
    }

    for (let y = height - 1; y >= 0; y--) {
      for (let x = width - 1; x >= 0; x--) {
        const idx = y * width + x;
        if (x < width - 1) dist[idx] = Math.min(dist[idx]!, dist[idx + 1]! + 1);
        if (y < height - 1)
          dist[idx] = Math.min(dist[idx]!, dist[idx + width]! + 1);
      }
    }

    this.cachedMaskRef = maskData;
    this.cachedDist = dist;

    return dist;
  }
}
