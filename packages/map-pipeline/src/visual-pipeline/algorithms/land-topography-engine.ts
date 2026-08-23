import { RGBColor } from "@/infrastructure/visual-pipeline/core/tactical-terrain.types";

export class LandTopographyEngine {
  private static readonly LAND_BASE: RGBColor = { r: 242, g: 244, b: 248 };
  private static readonly DOT_COLOR: RGBColor = { r: 218, g: 222, b: 228 };

  public static shadeLandColor(x: number, y: number): RGBColor {
    const isMajorDot = x % 32 === 0 && y % 32 === 0;
    if (isMajorDot) {
      return this.DOT_COLOR;
    }

    return this.LAND_BASE;
  }
}
