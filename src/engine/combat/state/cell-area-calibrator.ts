const GLOBAL_DEVIATION_FACTOR = 1.15;
const EARTH_SURFACE_AREA_KM2 = 510072000;

export class CellAreaCalibrator {
  private weights: Float64Array;
  private areaPerWeightUnit: number;

  constructor(height = 2048, width = 4096) {
    let totalWeight = 0;
    this.weights = new Float64Array(height);

    for (let y = 0; y < height; y++) {
      const latitudeRad = (0.5 - (y + 0.5) / height) * Math.PI;
      this.weights[y] = Math.cos(latitudeRad);
      totalWeight += this.weights[y]! * width;
    }

    this.areaPerWeightUnit = EARTH_SURFACE_AREA_KM2 / totalWeight;
  }

  public getCalibratedPixelArea(y: number): number {
    if (y < 0 || y >= this.weights.length) return 0;
    const w = this.weights[y] || 0;
    return w * this.areaPerWeightUnit * GLOBAL_DEVIATION_FACTOR;
  }
}
