import { GridCell } from "@/domain/map/grid-cell.schema";
import { GLOBAL_DEVIATION_FACTOR } from "@/domain/map/country-area-calibration.config";

export class CellAreaCalibrator {
  private weights: Float64Array;
  private areaPerWeightUnit: number;

  constructor(height: number, width: number, totalSurfaceArea: number) {
    let totalWeight = 0;
    this.weights = new Float64Array(height);
    for (let y = 0; y < height; y++) {
      const latitudeRad = (0.5 - (y + 0.5) / height) * Math.PI;
      this.weights[y] = Math.cos(latitudeRad);
      totalWeight += this.weights[y]! * width;
    }
    this.areaPerWeightUnit = totalSurfaceArea / totalWeight;
  }

  public getCalibratedCellArea(cell: GridCell): number {
    if (cell.y < 0 || cell.y >= 512) return 0;
    const w = this.weights[cell.y] || 0;
    const cellArea = w * this.areaPerWeightUnit * (cell.highResPixelCount / 16);
    return cellArea * GLOBAL_DEVIATION_FACTOR;
  }
}
