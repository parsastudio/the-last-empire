export class GdpDensityColorMapper {
  public getHeatmapColor(density: number): { r: number; g: number; b: number } {
    const factor = Math.min(1.0, density / 16);
    return {
      r: Math.floor(59 * (1.0 - factor) + 239 * factor),
      g: Math.floor(130 * (1.0 - factor) + 68 * factor),
      b: Math.floor(246 * (1.0 - factor) + 68 * factor),
    };
  }
}
