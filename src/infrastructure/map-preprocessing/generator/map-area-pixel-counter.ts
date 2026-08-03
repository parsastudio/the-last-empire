const GLOBAL_DEVIATION_FACTOR = 1.15;

export interface CountryAreaMapping {
  id: number;
  areaSqKm: number;
}

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
      totalWeight += weights[y]! * width;
    }
    return { weights, totalWeight };
  }
}

export class MapAreaPixelCounter {
  private areaCalculator = new AreaWeightCalculator();

  public calculateAreas(
    buffer: Uint8Array,
    width: number,
    height: number,
    maxId: number,
  ): Float64Array {
    const pixelAreas = new Float64Array(maxId);
    pixelAreas.fill(0);

    const totalSurfaceAreaSqKm =
      this.areaCalculator.calculateTotalSurfaceAreaSqKm();
    const { weights, totalWeight = 0 } = this.areaCalculator.generateRowWeights(
      height,
      width,
    );
    const areaPerUnit = totalSurfaceAreaSqKm / totalWeight;

    for (let y = 0; y < height; y++) {
      const rowWeight = weights[y]! * areaPerUnit;
      for (let x = 0; x < width; x++) {
        const id = buffer[y * width + x]!;
        if (id >= 11 && id < maxId) {
          pixelAreas[id] += rowWeight;
        }
      }
    }

    return pixelAreas;
  }

  public applyCalibratedAreas<T extends CountryAreaMapping>(
    countries: T[],
    pixelAreas: Float64Array,
  ): void {
    countries.forEach((c) => {
      if (c.id >= 11) {
        c.areaSqKm = Math.round(
          (pixelAreas[c.id] || 0) * GLOBAL_DEVIATION_FACTOR,
        );
      }
    });
  }
}
