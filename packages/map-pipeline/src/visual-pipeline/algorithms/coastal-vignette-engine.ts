import { RGBColor } from "@/infrastructure/visual-pipeline/core/tactical-terrain.types";

export class CoastalVignetteEngine {
  public static applyCoastalVignette(
    baseColor: RGBColor,
    oceanDistance: number,
  ): RGBColor {
    if (oceanDistance <= 0 || oceanDistance > 3.0) {
      return baseColor;
    }

    const glowFactor = ((3.0 - oceanDistance) / 3.0) * 0.45;
    const rTint = 34;
    const gTint = 70;
    const bTint = 112;

    return {
      r: Math.round(baseColor.r * (1 - glowFactor) + rTint * glowFactor),
      g: Math.round(baseColor.g * (1 - glowFactor) + gTint * glowFactor),
      b: Math.round(baseColor.b * (1 - glowFactor) + bTint * glowFactor),
    };
  }
}
