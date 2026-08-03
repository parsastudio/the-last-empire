const TOTAL_LAND_SURFACE_AREA_KM2 = 148940000;

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

    const estimatedLandWeightRatio = 0.29;
    this.areaPerWeightUnit =
      TOTAL_LAND_SURFACE_AREA_KM2 / (totalWeight * estimatedLandWeightRatio);
  }

  public getCalibratedPixelArea(y: number): number {
    if (y < 0 || y >= this.weights.length) return 0;
    const w = this.weights[y] || 0;
    return w * this.areaPerWeightUnit;
  }
}
