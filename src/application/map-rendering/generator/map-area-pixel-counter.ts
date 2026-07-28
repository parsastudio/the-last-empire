import { AreaWeightCalculator } from "./area-weight-calculator";
import { GLOBAL_DEVIATION_FACTOR } from "../../../domain/map/country-area-calibration.config";

export interface CountryAreaMapping {
  id: number;
  areaSqKm: number;
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
      const rowWeight = weights[y] * areaPerUnit;
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
