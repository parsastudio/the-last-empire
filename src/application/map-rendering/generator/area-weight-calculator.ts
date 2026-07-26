export class AreaWeightCalculator {
  private readonly earthRadius = 6378137;

  public calculateTotalSurfaceAreaSqKm(): number {
    const totalSurfaceArea = 4 * Math.PI * this.earthRadius * this.earthRadius;
    return totalSurfaceArea / 1000000;
  }

  public generateRowWeights(
    height: number,
    width: number,
  ): { weights: Float64Array; totalWeight: number } {
    let totalWeight = 0;
    const weights = new Float64Array(height);
    for (let y = 0; y < height; y++) {
      const latitudeRad = (0.5 - (y + 0.5) / height) * Math.PI;
      weights[y] = Math.cos(latitudeRad);
      totalWeight += weights[y] * width;
    }
    return { weights, totalWeight };
  }
}
