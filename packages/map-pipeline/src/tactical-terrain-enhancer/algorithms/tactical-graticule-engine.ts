import { RGBColor } from "@/infrastructure/tactical-terrain-enhancer/core/tactical-terrain.types";

export class TacticalGraticuleEngine {
  private static readonly GRID_INTERVAL_X = 256;
  private static readonly GRID_INTERVAL_Y = 256;
  private static readonly CROSSHAIR_HALF_SIZE = 3;

  public static applyGraticule(
    x: number,
    y: number,
    baseColor: RGBColor,
    isLand: boolean,
  ): RGBColor {
    if (isLand) {
      return baseColor;
    }

    const isGridX = x % this.GRID_INTERVAL_X === 0;
    const isGridY = y % this.GRID_INTERVAL_Y === 0;

    const nearX = x % this.GRID_INTERVAL_X;
    const nearY = y % this.GRID_INTERVAL_Y;

    const isCrosshairX =
      (nearX <= this.CROSSHAIR_HALF_SIZE ||
        nearX >= this.GRID_INTERVAL_X - this.CROSSHAIR_HALF_SIZE) &&
      nearY === 0;

    const isCrosshairY =
      (nearY <= this.CROSSHAIR_HALF_SIZE ||
        nearY >= this.GRID_INTERVAL_Y - this.CROSSHAIR_HALF_SIZE) &&
      nearX === 0;

    if (isCrosshairX || isCrosshairY) {
      return {
        r: Math.min(255, baseColor.r + 28),
        g: Math.min(255, baseColor.g + 45),
        b: Math.min(255, baseColor.b + 65),
      };
    }

    if ((isGridX && y % 8 < 4) || (isGridY && x % 8 < 4)) {
      return {
        r: Math.min(255, baseColor.r + 7),
        g: Math.min(255, baseColor.g + 12),
        b: Math.min(255, baseColor.b + 18),
      };
    }

    return baseColor;
  }
}
