import { RGBColor } from "@/infrastructure/visual-pipeline/core/tactical-terrain.types";

export class OceanBathymetryEngine {
  private static readonly DEEP_OCEAN: RGBColor = { r: 9, g: 17, b: 30 };
  private static readonly SHELF_ACCENT: RGBColor = { r: 20, g: 40, b: 68 };
  private static readonly LAKE_TONE: RGBColor = { r: 13, g: 24, b: 42 };

  public static calculateBathymetryColor(
    distance: number,
    isLake: boolean,
  ): RGBColor {
    if (isLake) {
      return this.LAKE_TONE;
    }

    if (distance > 5.0) {
      return this.DEEP_OCEAN;
    }

    const t = distance / 5.0;
    const smoothT = t * t * (3.0 - 2.0 * t);

    const r =
      this.SHELF_ACCENT.r + smoothT * (this.DEEP_OCEAN.r - this.SHELF_ACCENT.r);
    const g =
      this.SHELF_ACCENT.g + smoothT * (this.DEEP_OCEAN.g - this.SHELF_ACCENT.g);
    const b =
      this.SHELF_ACCENT.b + smoothT * (this.DEEP_OCEAN.b - this.SHELF_ACCENT.b);

    return {
      r: Math.round(r),
      g: Math.round(g),
      b: Math.round(b),
    };
  }
}
